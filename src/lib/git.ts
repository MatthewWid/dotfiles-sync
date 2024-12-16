import { existsSync as exists, mkdirSync as mkdir } from "node:fs";
import simpleGit, { type DefaultLogFields, type ListLogLine } from "simple-git";

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			GIT_REPO_LOCAL_PATH: string;
			GIT_REPO_REMOTE_URL: string;
		}
	}
}

export type LogLine = DefaultLogFields & ListLogLine;

if (!exists(process.env.GIT_REPO_LOCAL_PATH)) {
	mkdir(process.env.GIT_REPO_LOCAL_PATH, { recursive: true });
}

export const git = simpleGit(process.env.GIT_REPO_LOCAL_PATH);
