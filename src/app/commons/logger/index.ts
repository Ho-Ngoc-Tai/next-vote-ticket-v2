import { formatDate } from "@commons/utils/formatDateTime";
import winston from "winston";
const { combine, timestamp, printf, colorize } = winston.format;

const myFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});
const transports = [];

if (process.env.NODE_ENV !== "development") {
  transports.push(
    new winston.transports.Console({
      format: combine(colorize(), timestamp(), myFormat),
    })
  );
}

// luôn có file log
if (process.env.NODE_ENV !== "production") {
  transports.push(
    new winston.transports.File({
      filename: `${process.cwd()}/public/logger/log-${formatDate(new Date(), "yyyy-MM-dd")}.log`,
    })
  );
}

const logger = winston.createLogger({
  level: "info",
  format: combine(timestamp(), myFormat),
  transports: transports,
});

export { logger };
