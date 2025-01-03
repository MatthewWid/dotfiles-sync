/**
 * Retrieve a long-lived refresh token from a short-lived access code.
 *
 * Reference implementation: https://github.com/boly38/dropbox-refresh-token/blob/6fadb6842514eb6aa4c1dc41aa6f83ddfcf3db46/src/lib/dropboxRefreshToken.js#L49
 */

import assert from "node:assert";

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			DROPBOX_APP_KEY: string;
			DROPBOX_APP_SECRET: string;
			DROPBOX_ACCESS_CODE: string;
		}
	}
}

assert("DROPBOX_APP_KEY" in process.env, "Missing DROPBOX_APP_KEY");
assert("DROPBOX_APP_SECRET" in process.env, "Missing DROPBOX_APP_SECRET");
assert("DROPBOX_ACCESS_CODE" in process.env, "Missing DROPBOX_ACCESS_CODE");

const {
	DROPBOX_APP_KEY: appKey,
	DROPBOX_APP_SECRET: appSecret,
	DROPBOX_ACCESS_CODE: accessCode,
} = process.env;

/**
 * The official Dropbox npm package (`dropbox`) peculiarly does not provide a helper for acquiring a refresh token with an access code,
 * therefore we must manually make a request to the OAuth2 API endpoint directly.
 *
 * Endpoint documentation: https://www.dropbox.com/developers/documentation/http/documentation#oauth2-token
 */

const response = await fetch("https://api.dropbox.com/oauth2/token", {
	method: "POST",
	headers: {
		"Content-Type": "application/x-www-form-urlencoded",
		Authorization: `Basic ${btoa(`${appKey}:${appSecret}`)}`,
	},
	body: new URLSearchParams({
		code: accessCode,
		grant_type: "authorization_code",
	}),
});

const json = await response.json();

console.log(JSON.stringify(json, null, 2));
