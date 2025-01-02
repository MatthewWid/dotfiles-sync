const {
	DROPBOX_APP_KEY: appKey,
	DROPBOX_APP_SECRET: appSecret,
	DROPBOX_REFRESH_TOKEN: refreshToken,
	DROPBOX_ACCESS_TOKEN: initialAccessToken,
} = process.env;

const fetchNewAccessToken = async () => {
	const response = await fetch("https://api.dropboxapi.com/oauth2/token", {
		method: "POST",
		body: new URLSearchParams({
			grant_type: "refresh_token",
			refresh_token: refreshToken,
			client_id: appKey,
			client_secret: appSecret,
		}),
	});

	const json = (await response.json()) as { access_token: string };

	return json.access_token;
};

const isAccessTokenExpired = async () => {
	try {
		await fetch("https://api.dropboxapi.com/2/users/get_current_account", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${initialAccessToken}`,
			},
		});

		return false;
	} catch (error) {
		return true;
	}
};

export const getDropboxAccessToken = async () => {
	if (!initialAccessToken || (await isAccessTokenExpired())) {
		return await fetchNewAccessToken();
	}

	return initialAccessToken;
};
