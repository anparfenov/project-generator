import { blue, yellow, green, red, white, magenta } from "kolorist";
import path from "node:path";

type CommonConfig = { dir: string };
export type Category = { name: "frontend" | "backend" } & CommonConfig;
export type Bundler = { name: "webpack" | "vite" } & CommonConfig;
export type Framework = { name: "react" | "vue" | "svelte" | "vanilla" } & CommonConfig;
export type Testing = { name: "vitest" | "jest" | "mocha" } & CommonConfig;

// interface Info {
// 	categories: Category[];
// 	bundlers: Record<Category, Bundler[]>;
// 	frameworks: Record<Category, Framework[]>;
// 	testing: Record<Category, Testing[]>;
// }

const info = {
	categories: ["frontend", "backend"],
	bundlers: {
		frontend: ["webpack", "vite"],
		backend: [],
	},
	frameworks: {
		frontend: ["react", "vue", "svelte", "vanilla"],
		backend: ["nest"],
	},
	testing: {
		frontend: ["vitest", "jest", "mocha"],
		backend: ["jest"],
	},
};

const promptInfo: Record<string, { title: string; value: string }> = {
	frontend: {
		value: "frontend",
		title: yellow("frontend"),
	},
	backend: {
		value: "backend",
		title: blue("backend"),
	},
	react: {
		value: "react",
		title: blue("react"),
	},
	vue: {
		value: "vue",
		title: green("vue"),
	},
	vite: {
		value: "vite",
		title: magenta("vite"),
	},
	svelte: {
		value: "svelte",
		title: red("svelte"),
	},
	vanilla: {
		value: "vanilla",
		title: yellow("vanilla"),
	},
};

function getDefaultChoice(value: string) {
	return {
		value,
		title: white(value),
	};
}

export function getCategoryChoices() {
	return info["categories"].map((category) => promptInfo[category] ?? getDefaultChoice(category));
}

export function getFrameworkChoices(category: Category) {
	return info["frameworks"][category.name].map((framework) => promptInfo[framework] ?? getDefaultChoice(framework));
}

export function getBundlerInfo(category: Category) {
	return info["bundlers"][category.name].map((bundler) => promptInfo[bundler] ?? getDefaultChoice(bundler));
}

export function getTestingInfo(category: Category) {
	return info["testing"][category.name].map((testing) => promptInfo[testing] ?? getDefaultChoice(testing));
}

interface ConfigParams {
	category: Category["name"];
	bundler: Bundler["name"];
	framework: Framework["name"];
	testing: Testing["name"];
}

export class Config {
	category: Category = { name: "frontend", dir: "" };
	bundler: Bundler = { name: "webpack", dir: "" };
	framework: Framework = { name: "react", dir: "" };
	testing: Testing = { name: "vitest", dir: "" };

	#makeField<T extends ConfigParams[keyof ConfigParams]>(
		params: ConfigParams,
		field: keyof ConfigParams
	): { name: T; dir: string } {
		return {
			name: params[field] as T,
			dir: this.dirPrefix(path.join(params.category, `${field}/${params[field]}`)),
		};
	}

	public dirPrefix(pathname: string) {
		return path.join("./templates", pathname);
	}

	constructor(params: ConfigParams) {
		this.category = { name: params.category, dir: this.dirPrefix(path.join(params.category)) };
		this.bundler = this.#makeField<Bundler["name"]>(params, "bundler");
		this.framework = this.#makeField<Framework["name"]>(params, "framework");
		this.testing = this.#makeField<Testing["name"]>(params, "testing");
	}
}
