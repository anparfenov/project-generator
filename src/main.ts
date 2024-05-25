import { getFileConfig } from "./file_config.js";
import { Config } from "./config.js";
import { runProjectDirPrompt, runConfigPrompt } from "./prompt.js";
import fs from "node:fs";
import path from "node:path";

function isOptionArg(arg: string) {
	return arg.startsWith("--");
}

function isOptionHasValue(option: string) {
	return option.includes("=");
}

type Args = Record<string, string | number | boolean | null> & { _?: string[] };

function getArgs(): Args {
	const args = process.argv.slice(2);

	return args.reduce<Args>((acc, arg) => {
		if (isOptionArg(arg)) {
			let option: string = arg;
			let value: string | number | boolean | null = true;
			if (isOptionHasValue(option)) {
				const splitted = arg.split("=");
				option = splitted[0];
				value = splitted[1];
			}
			acc[option.substring(2)] = value;
		} else {
			if (acc._) {
				acc._.push(arg);
			} else {
				acc._ = [arg];
			}
		}
		return acc;
	}, {});
}

async function main() {
	const args = getArgs();

	console.log("args", args);

	let projectDir = args._?.[0];
	if (!projectDir) {
		console.log("Please provide project dir");
		return;
	}

	projectDir = path.resolve(projectDir);
	console.log("projectDir reslove", projectDir);
	if (fs.existsSync(projectDir)) {
		const promptResult = await runProjectDirPrompt();
		console.log("prompt result exitst sync");
		if (!promptResult.projectDir) {
			console.log("prompt result exitst sync");
			return;
		}
		fs.rmSync(projectDir, { recursive: true, force: true });
		fs.mkdirSync(projectDir);
	}

	let config = null;
	if (args.prompt) {
		const promptResult = await runConfigPrompt();
		config = new Config(promptResult);
	} else if (args.config) {
		const configResult = getFileConfig(args.config as string);
		config = new Config(configResult);
	} else {
		// TODO:Add default args
		// config = new Config();
	}

	console.log("project dir", projectDir);
	console.log("config", config);
}

main();
