import { basename, join } from "node:path";
import AdmZip from "adm-zip";
import { getDropboxInstance } from "./lib/dropbox";
import { getGitInstance } from "./lib/git";
import { logger } from "./lib/pino";
import { didDropboxFilesChange } from "./utils/did-dropbox-files-change";
import { fetchGitRepository } from "./utils/fetch-git-repository";
import { storeLatestDropboxCursor } from "./utils/store-latest-dropbox-cursor";

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV: "development" | "production";
		}
	}
}

export const main = async () => {
	logger.debug({
		DROPBOX_APP_KEY: process.env.DROPBOX_APP_KEY,
		DROPBOX_APP_SECRET: process.env.DROPBOX_APP_SECRET,
		DROPBOX_REFRESH_TOKEN: process.env.DROPBOX_REFRESH_TOKEN,
		DROPBOX_ACCESS_CODE: process.env.DROPBOX_ACCESS_CODE,
		DROPBOX_ACCESS_TOKEN: process.env.DROPBOX_ACCESS_TOKEN,
		DROPBOX_DOTFILES_PATH: process.env.DROPBOX_DOTFILES_PATH,
		GIT_REPO_LOCAL_PATH: process.env.GIT_REPO_LOCAL_PATH,
		GIT_REPO_REMOTE_URL: process.env.GIT_REPO_REMOTE_URL,
		PARAMETER_STORE_DROPBOX_CURSOR_NAME:
			process.env.PARAMETER_STORE_DROPBOX_CURSOR_NAME,
		PARAMETER_STORE_DROPBOX_CURSOR_DEFAULT_VALUE:
			process.env.PARAMETER_STORE_DROPBOX_CURSOR_DEFAULT_VALUE,
	});

	const shouldRefetchFiles = await didDropboxFilesChange();

	if (!shouldRefetchFiles) {
		logger.info("No file changes detected. Aborting");

		await storeLatestDropboxCursor();

		return;
	}

	await fetchGitRepository();

	const dropbox = await getDropboxInstance();

	logger.info(
		{ DROPBOX_DOTFILES_PATH: process.env.DROPBOX_DOTFILES_PATH },
		"Downloading dotfiles folder as zip from Dropbox",
	);

	// Dropbox package types are incorrect and do not include the `fileBinary` field in the response body
	const downloadZipResponse = (await dropbox.filesDownloadZip({
		path: process.env.DROPBOX_DOTFILES_PATH,
	})) as Awaited<ReturnType<typeof dropbox.filesDownloadZip>> & {
		result: { fileBinary: Buffer };
	};

	logger.info(
		{
			fileBinarySize: Buffer.byteLength(downloadZipResponse.result.fileBinary),
		},
		"Dropbox zip file contents downloaded. Extracting to repository path",
	);

	const zip = new AdmZip(downloadZipResponse.result.fileBinary);
	zip.extractAllTo(process.env.GIT_REPO_LOCAL_PATH, true);

	const extractedToPath = join(
		process.env.GIT_REPO_LOCAL_PATH,
		basename(process.env.DROPBOX_DOTFILES_PATH),
	);

	logger.info(
		{ extractedToPath },
		"Dropbox zip file contents extracted to repository path",
	);

	const git = await getGitInstance();

	const { isClean } = await git.status(["--", extractedToPath]);

	if (isClean()) {
		logger.info("Git repository is clean. Nothing to commit");
	} else {
		logger.info("Git repository is not clean. Committing new changes");

		await git.add(extractedToPath);
		await git.commit(`chore: automated backup - ${new Date().toUTCString()}`);
		await git.push();

		logger.info(
			"Changes successfully committed and pushed to remote repository",
		);
	}

	await storeLatestDropboxCursor();
};
