import { GetParameterCommand } from "@aws-sdk/client-ssm";
import { getDropboxInstance } from "../lib/dropbox";
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

		try {
			const response = await ssm.send(command);

			if (response.Parameter?.Value) {
				cursor = response.Parameter.Value;
			}
		} catch (error) {}
	}

	if (!cursor) {
		return true;
	}

	const dropbox = await getDropboxInstance();

	const response = await dropbox.filesListFolderContinue({ cursor });

	return response.result.entries.length > 0;
};
