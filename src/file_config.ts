import fs from "node:fs";
import path from "node:path";

export function getFileConfig(configFile: string) {
	const ext = path.basename(configFile).split(".")[1];
	const file = fs.readFileSync(path.resolve(configFile), "utf-8");
	try {
		const json = JSON.parse(file);
		return json;
	} catch {
		return null;
	}
}
