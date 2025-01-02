import { existsSync as exists } from "node:fs";
import { basename, join } from "node:path";
import AdmZip from "adm-zip";
import { getDropboxInstance } from "./lib/dropbox";
import { getGitInstance } from "./lib/git";

export const main = async () => {
	const dropbox = await getDropboxInstance();
	const git = await getGitInstance();

	if (exists(join(process.env.GIT_REPO_LOCAL_PATH, ".git"))) {
		await git.fetch();
	} else {
		await git.clone(
			process.env.GIT_REPO_REMOTE_URL,
			process.env.GIT_REPO_LOCAL_PATH,
			["--no-checkout"]
		);
	}

	const downloadZipResponse = await dropbox.filesDownloadZip({
		path: process.env.DROPBOX_DOTFILES_PATH,
	});

	// @ts-expect-error - Dropbox package types are incorrect and do not include the `fileBinary` field in the response body
	const zip = new AdmZip(downloadZipResponse.result.fileBinary);
	zip.extractAllTo(process.env.GIT_REPO_LOCAL_PATH, true);

	const extractedToPath = join(
		process.env.GIT_REPO_LOCAL_PATH,
		basename(process.env.DROPBOX_DOTFILES_PATH)
	);

	const { isClean } = await git.status(["--", extractedToPath]);

	if (!isClean()) {
		await git.add(extractedToPath);
		await git.commit(`chore: automated backup - ${new Date().toUTCString()}`);
		await git.push();
	}

	/*
	const entries = await readdir(extractedToPath);

	await Promise.all(
		entries.map((entry) => {
			const from = resolve(extractedToPath, entry);
			const to = resolve(process.env.GIT_REPO_LOCAL_PATH, entry);

			return rename(from, to);
		})
	);
	*/
};
