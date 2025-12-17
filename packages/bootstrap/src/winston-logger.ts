import winston from "winston";

import type { ILogger } from "./i-logger.ts";

const getLogger = (): ILogger => {
  const logger = winston.createLogger({
    level: process.env["YNAB_PLUS_LOG_LEVEL"] ?? "info",
    format: winston.format.json(),
    defaultMeta: { service: "user-service" },
    transports: [
      new winston.transports.File({ filename: "error.log", level: "error" }),
      new winston.transports.File({ filename: "combined.log" })
    ]
  });

  if (process.env["NODE_ENV"] !== "production") {
    logger.add(
      new winston.transports.Console({
        format: winston.format.simple()
      })
    );
  }

  return logger;
};

export const getWinstonLogger = () => {
  const logger = getLogger();

  const getChildLogger = <TContext extends object>(context: TContext) => {
    return logger.child(context);
  };

  return {
    debug: logger.debug.bind(logger),
    info: logger.info.bind(logger),
    error: logger.error.bind(logger),
    warn: logger.warn.bind(logger),
    verbose: logger.verbose.bind(logger),
    silly: logger.verbose.bind(logger),
    child: getChildLogger
  };
};
