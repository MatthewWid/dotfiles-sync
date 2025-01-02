import type { files } from "dropbox";

type FileMetadata = files.FileMetadata;

export const getModifiedFiles = (
	files: FileMetadata[],
	date: Date,
): FileMetadata[] =>
	files.filter(({ server_modified }) => new Date(server_modified) > date);
