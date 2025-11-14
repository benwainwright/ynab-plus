import winston from "winston";

import type { ILogger } from "./i-logger.ts";

export const getWinstonLogger = (): ILogger => {
  const logger = winston.createLogger({
    format: winston.format.json(),
    defaultMeta: { service: "user-service" },
    transports: [
      new winston.transports.File({ filename: "error.log", level: "error" }),
      new winston.transports.File({ filename: "combined.log" }),
    ],
  });

  if (process.env["NODE_ENV"] !== "production") {
    const logFormat = winston.format.printf(function (info) {
      return `${info.level}: ${String(info.message)} [${String(info["context"])}]`;
    });

    logger.add(
      new winston.transports.Console({
        level: "silly",
        format: winston.format.combine(winston.format.colorize(), logFormat),
      }),
    );
  }

  return logger;
};
