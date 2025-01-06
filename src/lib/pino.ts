import { pino } from "pino";

const { NODE_ENV: env } = process.env;

export const logger = pino({
	level: env === "production" ? "info" : "debug",
});
