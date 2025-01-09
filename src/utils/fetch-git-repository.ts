import { existsSync as exists } from "node:fs";
import { join } from "node:path";
import { getGitInstance } from "../lib/git";
import { logger } from "../lib/pino";

const { GIT_REPO_CONFIG_NAME: configName, GIT_REPO_CONFIG_EMAIL: configEmail } =
	process.env;

export const fetchGitRepository = async () => {
	const git = await getGitInstance();

	if (exists(join(process.env.GIT_REPO_LOCAL_PATH, ".git"))) {
		logger.info(
			{ GIT_REPO_LOCAL_PATH: process.env.GIT_REPO_LOCAL_PATH },
			"Git local repository already exists. Fetching latest changes",
		);

		await git.fetch();
	} else {
		logger.info(
			{
				GIT_REPO_REMOTE_URL: process.env.GIT_REPO_REMOTE_URL,
				GIT_REPO_LOCAL_PATH: process.env.GIT_REPO_LOCAL_PATH,
			},
			"Git local repository does not exist. Cloning repository",
		);

		await git.clone(
			process.env.GIT_REPO_REMOTE_URL,
			process.env.GIT_REPO_LOCAL_PATH,
			["--no-checkout"],
		);
	}

	await git.reset(["--", ".", ":!dotfiles"]);
	await git.addConfig("user.name", configName);
	await git.addConfig("user.email", configEmail);
};
