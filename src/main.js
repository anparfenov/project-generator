import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import minimist from "minimist";
import prompts from "prompts";
import { blue, green, magenta, red, reset, yellow } from "kolorist";

// Inspired :) by create-vite. @see https://github.com/vitejs/vite/tree/main/packages/create-vite

// Avoids autoconversion to number of the project name by defining that the args
// non associated with an option ( _ ) needs to be parsed as a string. See #4606
const argv = minimist(process.argv.slice(2), { string: ["_"] });
const cwd = process.cwd();

// TODO: change colors
const CONFIG = {
	frontend: {
		color: yellow,
		templates: {
			vanilla: {
				color: yellow,
			},
			react: {
				color: blue,
			},
			lit: {
				color: magenta,
			},
		},
	},
	backend: {
		color: blue,
		templates: {
			fastify: {
				color: blue,
			},
		},
	},
	console: {
		color: green,
		templates: {
			default: {
				color: green,
			},
		},
	},
};

const templateDirName = "templates";
const defaultTargetDir = "test";
const defaultEnvironment = "frontend";
const defaultTemplate = "vanilla";
const defaultPackageManager = "npm";

// NOTE: the same structure as in templatesConfig. Don't forget to sync
function createTemplateEntry(env, templateName) {
	const templateConfig = CONFIG[env]?.templates[templateName];
	if (!templateConfig) {
		return {
			name: templateName,
			color: green,
		};
	}

	return { ...templateConfig, name: templateName };
}

function createEnvEntry(env) {
	if (!CONFIG[env]) {
		return {
			name: env,
			color: green,
			templates: {},
		};
	}

	return { ...CONFIG[env], name: env, templates: {} };
}

// map file structure to config
function mapFileStructureToConfig() {
	const envsDir = fs.readdirSync(path.resolve(templateDirName));

	let templateNamesByEnv = {};
	let templatesConfig = {};
	for (let env of envsDir) {
		templatesConfig[env] = createEnvEntry(env);
		templateNamesByEnv[env] = [];
		const templatesDir = fs.readdirSync(path.resolve(templateDirName, env));
		for (let template of templatesDir) {
			const templateEntry = createTemplateEntry(env, template);
			templatesConfig[env].templates[templateEntry.name] = templateEntry;
			templateNamesByEnv[env].push(template);
		}
	}

	return { config: templatesConfig, envNames: envsDir, templateNamesByEnv };
}

async function init() {
	const argTargetDir = formatTargetDir(argv._[0]);
	const argTemplate = argv.template || argv.t;
	const argEnvironment = argv.environment || argv.e;

	const { config, templateNamesByEnv, envNames } = mapFileStructureToConfig();

	const templatesByEnv = (env) => Object.values(config[env].templates);
	const getEnv = (env) => env ?? argEnvironment ?? defaultEnvironment;

	const envs = Object.values(config);

	let targetDir = argTargetDir || defaultTargetDir;
	const getProjectName = () => (targetDir === "." ? path.basename(path.resolve()) : targetDir);

	let promptResult;

	try {
		promptResult = await prompts(
			[
				{
					type: argTargetDir ? null : "text",
					name: "projectName",
					message: reset("Project name:"),
					initial: defaultTargetDir,
					onState: (state) => {
						targetDir = formatTargetDir(state.value) || defaultTargetDir;
					},
				},
				{
					type: () => (!fs.existsSync(targetDir) || isEmpty(targetDir) ? null : "confirm"),
					name: "overwrite",
					message: () =>
						(targetDir === "." ? "Current directory" : `Target directory "${targetDir}"`) +
						` is not empty. Remove existing files and continue?`,
				},
				{
					type: (_, { overwrite }) => {
						console.log("hello");
						if (overwrite === false) {
							throw new Error(red("✖") + " Operation cancelled");
						}
						return null;
					},
					name: "overwriteChecker",
				},
				{
					type: () => (isValidPackageName(getProjectName()) ? null : "text"),
					name: "packageName",
					message: reset("Package name:"),
					initial: () => toValidPackageName(getProjectName()),
					validate: (dir) => isValidPackageName(dir) || "Invalid package.json name",
				},
				{
					type: argEnvironment && envNames.includes(argEnvironment) ? null : "select",
					name: "environment",
					message: reset("Select an environment:"),
					initial: 0,
					choices: envs.map((environment) => {
						const environmentColor = environment.color;
						return {
							title: environmentColor(environment.name),
							value: environment.name,
						};
					}),
				},
				{
					type: (_, values) =>
						templateNamesByEnv[getEnv(values.environment)]?.includes(argTemplate) ? null : "select",
					name: "template",
					message: reset("Select a template:"),
					initial: 0,
					choices: (_, values) =>
						templatesByEnv(getEnv(values.environment)).map((template) => {
							const templateColor = template.color;
							return {
								title: templateColor(template.name),
								value: template.name,
							};
						}),
				},
			],
			{
				onCancel: (e) => {
					console.log("on cancel", e);
					throw new Error(red("✖") + " Operation cancelled");
				},
			}
		);
	} catch (cancelled) {
		console.log(cancelled.message);
		return;
	}

	// user choice associated with prompts
	const { template, overwrite, packageName, environment } = promptResult;

	targetDir = path.join(cwd, targetDir);

	if (overwrite) {
		emptyDir(targetDir);
	} else if (!fs.existsSync(targetDir)) {
		fs.mkdirSync(targetDir, { recursive: true });
	}

	const pkgManager = defaultPackageManager; // I use npm everytime

	console.log(`\nScaffolding project in ${targetDir}...`);

	const templateDir = path.resolve(
		path.dirname(fileURLToPath(import.meta.url)),
		"../templates",
		environment ?? argEnvironment,
		template ?? argTemplate ?? defaultTemplate // TODO: parse template name
	);

	moveTemplateFilesToProjectDir(templateDir, targetDir);

	updatePackageJson(templateDir, targetDir, packageName);

	const cdProjectName = path.relative(cwd, targetDir);
	console.log(`\nDone. Now run:\n`);
	if (targetDir !== cwd) {
		console.log(`  cd ${cdProjectName.includes(" ") ? `"${cdProjectName}"` : cdProjectName}`);
	}
	console.log(`  ${pkgManager} install`);
	console.log(`  ${pkgManager} run dev\n`);
}

function updatePackageJson(templateDir, targetDir, packageName) {
	const pkg = JSON.parse(fs.readFileSync(path.join(templateDir, "package.json"), "utf-8"));

	pkg.name = packageName || path.basename(targetDir);

	fs.writeFileSync(path.resolve(targetDir, "package.json"), JSON.stringify(pkg, null, 2) + "\n");
}

function moveTemplateFilesToProjectDir(templateDir, targetDir) {
	const files = fs.readdirSync(templateDir);
	const validFiles = files.filter((filename) => filename !== "package.json" && filename !== "node_modules");
	for (const file of validFiles) {
		copy(path.join(templateDir, file), path.join(targetDir, file));
	}
}

function formatTargetDir(targetDir) {
	return targetDir?.trim().replace(/\/+$/g, "");
}

function copy(src, dest) {
	const stat = fs.statSync(src);
	if (stat.isDirectory()) {
		copyDir(src, dest);
	} else {
		fs.copyFileSync(src, dest);
	}
}

function isValidPackageName(projectName) {
	// I don't know what this regex is doing :)
	return /^(?:@[a-z\d\-*~][a-z\d\-*._~]*\/)?[a-z\d\-~][a-z\d\-._~]*$/.test(projectName);
}

function toValidPackageName(projectName) {
	return projectName
		.trim()
		.toLowerCase()
		.replace(/\s+/g, "-")
		.replace(/^[._]/, "")
		.replace(/[^a-z\d\-~]+/g, "-");
}

function copyDir(srcDir, destDir) {
	fs.mkdirSync(destDir, { recursive: true });
	for (const file of fs.readdirSync(srcDir)) {
		const srcFile = path.resolve(srcDir, file);
		const destFile = path.resolve(destDir, file);
		copy(srcFile, destFile);
	}
}

function isEmpty(path) {
	const files = fs.readdirSync(path);
	return files.length === 0 || (files.length === 1 && files[0] === ".git");
}

function emptyDir(dir) {
	if (!fs.existsSync(dir)) {
		return;
	}
	for (const file of fs.readdirSync(dir)) {
		if (file === ".git") {
			continue;
		}
		fs.rmSync(path.resolve(dir, file), { recursive: true, force: true });
	}
}

init().catch((e) => {
	console.log("catch error");
	console.error(e);
});
