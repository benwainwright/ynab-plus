import winston from "winston";
import winstonDevConsole from "@epegzz/winston-dev-console";

import type { ILogger } from "./i-logger.ts";

export const getWinstonLogger = (): ILogger => {
  if (process.env["NODE_ENV"] !== "production") {
    const logger = winston.createLogger({
      level: process.env["YNAB_PLUS_LOG_LEVEL"] ?? "info",
    });

    const devConsole =
      winstonDevConsole as unknown as typeof winstonDevConsole.default;

    logger.add(
      devConsole.transport({
        showTimestamps: true,
        addLineSeparation: true,
      }),
    );

    return logger;
  }

  const logger = winston.createLogger({
    format: winston.format.json(),
    defaultMeta: { service: "user-service" },
    transports: [
      new winston.transports.File({ filename: "error.log", level: "error" }),
      new winston.transports.File({ filename: "combined.log" }),
    ],
  });

  return logger;
};
