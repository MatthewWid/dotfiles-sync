import { SSMClient } from "@aws-sdk/client-ssm";

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			PARAMETER_STORE_DROPBOX_CURSOR_NAME?: string;
			PARAMETER_STORE_DROPBOX_CURSOR_DEFAULT_VALUE?: string;
		}
	}
}

let instance: SSMClient;

export const getSsmInstance = async () => {
	if (!instance) {
		instance = new SSMClient();
	}

	return instance;
};
