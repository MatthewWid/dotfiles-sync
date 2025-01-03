import { PutParameterCommand } from "@aws-sdk/client-ssm";
import { getDropboxInstance } from "../lib/dropbox";
import { getSsmInstance } from "../lib/ssm";

const {
	PARAMETER_STORE_DROPBOX_CURSOR_NAME: parameterStoreDropboxCursorName,
	DROPBOX_DOTFILES_PATH: dropboxDotfilesPath,
} = process.env;

export const storeLatestDropboxCursor = async (): Promise<string> => {
	const dropbox = await getDropboxInstance();

	const response = await dropbox.filesListFolderGetLatestCursor({
		path: dropboxDotfilesPath,
		include_deleted: true,
		recursive: true,
	});

	if (parameterStoreDropboxCursorName) {
		const ssm = await getSsmInstance();

		const command = new PutParameterCommand({
			Name: parameterStoreDropboxCursorName,
			Value: response.result.cursor,
			Overwrite: true,
		});

		try {
			await ssm.send(command);
		} catch (error) {}
	}

	return response.result.cursor;
};
