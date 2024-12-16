import { Dropbox, type files } from "dropbox";

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			DROPBOX_ACCESS_TOKEN: string;
			DROPBOX_DOTFILES_PATH: string;
		}
	}
}

export type FolderEntry = files.ListFolderResult["entries"][number];
export type FileReference = files.FileMetadataReference;
export type FileMetadata = files.FileMetadata;
export type Cursor = files.ListFolderCursor;

export const dropbox = new Dropbox({
	accessToken: process.env.DROPBOX_ACCESS_TOKEN,
});
