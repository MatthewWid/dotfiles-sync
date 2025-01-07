import { DeleteParameterCommand } from "@aws-sdk/client-ssm";
import { getSsmInstance } from "../lib/ssm";

const { PARAMETER_STORE_DROPBOX_CURSOR_NAME: parameterStoreDropboxCursorName } =
	process.env;

const ssm = await getSsmInstance();

const command = new DeleteParameterCommand({
	Name: parameterStoreDropboxCursorName,
});

await ssm.send(command);

console.log(
	`Successfully deleted parameter "${parameterStoreDropboxCursorName}".`,
);
