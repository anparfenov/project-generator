import prompts, { Answers } from "prompts";
import { getBundlerInfo, getCategoryChoices, getFrameworkChoices, getTestingInfo } from "./config.js";

export async function runConfigPrompt(): Promise<Answers<"category" | "framework" | "bundler" | "testing">> {
	const response = await prompts([
		{
			type: "select",
			name: "category",
			message: "enter a category",
			choices: getCategoryChoices(),
		},
		{
			type: "select",
			name: "framework",
			message: "enter a framework",
			choices: (_, values) => getFrameworkChoices(values["category"]),
		},
		{
			type: "select",
			name: "bundler",
			message: "enter a bundler",
			choices: (_, values) => getBundlerInfo(values["category"]),
		},
		{
			type: "select",
			name: "testing",
			message: "enter a testing",
			choices: (_, values) => getTestingInfo(values["category"]),
		},
	]);

	console.log(response); // => { value: 24 }

	return response;
}

export async function runProjectDirPrompt() {
	const response = await prompts({
		type: "confirm",
		name: "projectDir",
		message: "rewrite directory?",
		initial: false,
	});

	console.log("projectDir response", response);

	return response;
}
