import assert from "node:assert";
import { existsSync as exists, mkdirSync as mkdir } from "node:fs";
import simpleGit, {
	type SimpleGit,
	type DefaultLogFields,
	type ListLogLine,
} from "simple-git";

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			GIT_REPO_LOCAL_PATH: string;
			GIT_REPO_REMOTE_URL: string;
		}
	}
}

assert("GIT_REPO_LOCAL_PATH" in process.env, "GIT_REPO_LOCAL_PATH");
assert("GIT_REPO_REMOTE_URL" in process.env, "GIT_REPO_REMOTE_URL");

const { GIT_REPO_LOCAL_PATH: localPath } = process.env;

export type LogLine = DefaultLogFields & ListLogLine;

let instance: SimpleGit;

export const getGitInstance = async () => {
	if (!instance) {
		if (!exists(localPath)) {
			mkdir(localPath, { recursive: true });
		}

		instance = simpleGit(localPath);
	}

	return instance;
};
