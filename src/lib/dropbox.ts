import assert from "node:assert";
import { Dropbox, type files } from "dropbox";
import { getDropboxAccessToken } from "../utils/get-dropbox-access-token";

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			DROPBOX_APP_KEY: string;
			DROPBOX_APP_SECRET: string;
			DROPBOX_REFRESH_TOKEN: string;
			DROPBOX_ACCESS_TOKEN?: string;
			DROPBOX_DOTFILES_PATH: string;
		}
	}
}

assert("DROPBOX_APP_KEY" in process.env, "DROPBOX_APP_KEY");
assert("DROPBOX_APP_SECRET" in process.env, "DROPBOX_APP_SECRET");
assert("DROPBOX_REFRESH_TOKEN" in process.env, "DROPBOX_REFRESH_TOKEN");
assert("DROPBOX_DOTFILES_PATH" in process.env, "DROPBOX_DOTFILES_PATH");

export type FolderEntry = files.ListFolderResult["entries"][number];
export type FileReference = files.FileMetadataReference;
export type FileMetadata = files.FileMetadata;
export type Cursor = files.ListFolderCursor;

let instance: Dropbox;

export const getDropboxInstance = async () => {
	if (!instance) {
		instance = new Dropbox({
			accessToken: await getDropboxAccessToken(),
		});
	}

	return instance;
};
