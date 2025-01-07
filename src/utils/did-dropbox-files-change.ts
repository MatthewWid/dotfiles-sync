import { GetParameterCommand } from "@aws-sdk/client-ssm";
import { getDropboxInstance } from "../lib/dropbox";
import { logger } from "../lib/pino";
import { getSsmInstance } from "../lib/ssm";

const {
	PARAMETER_STORE_DROPBOX_CURSOR_NAME: parameterStoreDropboxCursorName,
	PARAMETER_STORE_DROPBOX_CURSOR_DEFAULT_VALUE:
		parameterStoreDropboxCursorDefaultValue,
} = process.env;

export const didDropboxFilesChange = async () => {
	let cursor = parameterStoreDropboxCursorDefaultValue || null;

	if (parameterStoreDropboxCursorName) {
		const ssm = await getSsmInstance();

		const command = new GetParameterCommand({
			Name: parameterStoreDropboxCursorName,
		});

		logger.debug(
			{ parameterStoreDropboxCursorName },
			"Attempting to fetch latest Dropbox cursor from Systems Manager Parameter Store",
		);

		try {
			const response = await ssm.send(command);

			if (response.Parameter?.Value) {
				logger.debug(
					response,
					"Successfully fetched Dropbox cursor from Systems Manager Parameter Store",
				);

				cursor = response.Parameter.Value;
			}
		} catch (error) {
			logger.debug(
				error,
				"Failed to fetch Dropbox cursor from Systems Manager Parameter Store",
			);
		}
	}

	logger.debug({ cursor }, "Initial cursor value");

	if (!cursor) {
		logger.info("No cursor found. Files are assumed to have changed");

		return true;
	}

	const dropbox = await getDropboxInstance();

	const response = await dropbox.filesListFolderContinue({ cursor });

	logger.debug(response, "Initial cursor filesListFolderContinue response");

	const hasEntries = response.result.entries.length > 0;

	logger.info(
		{ numberOfEntries: response.result.entries.length },
		"Number of changes since initial cursor",
	);

	return hasEntries;
};
