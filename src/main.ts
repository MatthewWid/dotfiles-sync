import { existsSync as exists } from "node:fs";
import { join } from "node:path";
import { git } from "./lib/git";
import { getFilesMetaRecursive } from "./utils/get-files-meta-recursive";
import { getLatestCommitDate } from "./utils/get-latest-commit-date";
import { getModifiedFiles } from "./utils/get-modified-files";
import { dropbox } from "./lib/dropbox";

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV: "development" | "production";
		}
	}
}

export const main = async () => {
	if (exists(join(process.env.GIT_REPO_LOCAL_PATH, ".git"))) {
		await git.fetch();
	} else {
		await git.clone(
			process.env.GIT_REPO_REMOTE_URL,
			process.env.GIT_REPO_LOCAL_PATH,
			["--no-checkout"]
		);
	}

	const latestCommitDate = await getLatestCommitDate();

	const allFiles = await getFilesMetaRecursive();

	const modifiedFiles = getModifiedFiles(allFiles, latestCommitDate);

	if (modifiedFiles.length === 0) {
		console.log("No files have been changed since last commit. Aborting.");
		return;
	}

	console.log("Modified files:", modifiedFiles);
};
