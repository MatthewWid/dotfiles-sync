import type { FileMetadata } from "../lib/dropbox";

export const downloadFiles = async (
	files: FileMetadata[],
	path = process.env.GIT_REPO_LOCAL_PATH,
) => {};
