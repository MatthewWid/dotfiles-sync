import {
	type Cursor,
	type FileMetadata,
	type FileReference,
	type FolderEntry,
	getDropboxInstance,
} from "../lib/dropbox";
import { DROPBOX_TAG_FILE } from "./constants";

const addFilesToFileList = (files: FileMetadata[], entries: FolderEntry[]) => {
	const filtered = entries.filter(
		({ ".tag": tag }) => tag === DROPBOX_TAG_FILE,
	) as FileReference[];

	files.push(...filtered);
};

export const getFilesMetaRecursive = async (
	path = process.env.DROPBOX_DOTFILES_PATH,
): Promise<FileMetadata[]> => {
	const dropbox = await getDropboxInstance();

	const files: FileMetadata[] = [];

	const getMore = async (cursor: Cursor) => {
		const listFolderContinueResponse = await dropbox.filesListFolderContinue({
			cursor,
		});

		addFilesToFileList(files, listFolderContinueResponse.result.entries);

		if (listFolderContinueResponse.result.has_more) {
			await getMore(listFolderContinueResponse.result.cursor);
		}
	};

	const listFolderResponse = await dropbox.filesListFolder({
		path,
		recursive: true,
	});

	addFilesToFileList(files, listFolderResponse.result.entries);

	if (listFolderResponse.result.has_more) {
		await getMore(listFolderResponse.result.cursor);
	}

	return files;
};
