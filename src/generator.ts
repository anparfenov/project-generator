import { Config } from "./config.js";
import fs from "node:fs";
import path from "node:path";

export function generatePackageJsonContent(config: Config): Record<string, unknown> {
	const commonPackageContent = fs.readFileSync(path.join(config.category.dir, "common", "package.json"), "utf-8");
	const commonPackageJson = JSON.parse(commonPackageContent);
	const bundlerPackageContent = fs.readFileSync(path.join(config.bundler.dir, "package.json"), "utf-8");
	const bundlerPackageJson = JSON.parse(bundlerPackageContent);
	const frameworkPackageContent = fs.readFileSync(path.join(config.framework.dir, "package.json"), "utf-8");
	const frameworkPackageJson = JSON.parse(frameworkPackageContent);
	const testingPackageContent = fs.readFileSync(path.join(config.testing.dir, "package.json"), "utf-8");
	const testingPackageJson = JSON.parse(testingPackageContent);

	// TODO: do deep merge
	return {
		...commonPackageJson,
		...bundlerPackageJson,
		...frameworkPackageJson,
		...testingPackageJson,
	};
}

function getTemplateConfig(config: Config) {
	return {
		categoryFolder: `./templates/${config.category}/`,
	};
}

export function generateProject(config: Config) {}
