import {
	PutParameterCommand,
	type PutParameterCommandInput,
} from "@aws-sdk/client-ssm";
import { getDropboxInstance } from "../lib/dropbox";
import { logger } from "../lib/pino";
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

	logger.debug(
		response,
		"Latest cursor filesListFolderGetLatestCursor response"
	);

	if (parameterStoreDropboxCursorName) {
		const ssm = await getSsmInstance();

		const input: PutParameterCommandInput = {
			Name: parameterStoreDropboxCursorName,
			Value: response.result.cursor,
			Type: "String",
			Overwrite: true,
		};

		logger.debug(
			input,
			"Attempting to store latest Dropbox cursor in Systems Manager Parameter Store"
		);

		const command = new PutParameterCommand(input);

		try {
			await ssm.send(command);

			logger.info(
				"Successfully stored Dropbox cursor in Systems Manager Parameter Store"
			);
		} catch (error) {
			logger.info(
				error,
				"Failed to store Dropbox cursor in Systems Manager Parameter Store"
			);
		}
	}

	return response.result.cursor;
};
