import { type LogLine, getGitInstance } from "../lib/git";

export const getLatestCommitDate = async (): Promise<Date> => {
	const git = await getGitInstance();

	const log = await git.log({ "--max-count": 1 });

	if (!log.latest) {
		throw new Error(`No latest commit found. ${JSON.stringify(log, null, 2)}`);
	}

	return new Date((log.latest as LogLine).date);
};
