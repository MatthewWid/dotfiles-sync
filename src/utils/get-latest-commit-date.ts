import { type LogLine, git } from "../lib/git";

export const getLatestCommitDate = async (): Promise<Date> => {
	const log = await git.log({ "--max-count": 1 });

	if (!log.latest) {
		console.error("No latest commit found.", log);
	}

	return new Date((log.latest as LogLine).date);
};
