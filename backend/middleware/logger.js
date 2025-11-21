const morgan = require("morgan");
const winston = require("winston");
const path = require("path");
const fs = require("fs");

// ensure logs folder exists
const logDir = path.join(__dirname, "..", "logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`)
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: path.join(logDir, "combined.log") })
  ],
});

const morganMiddleware = morgan("combined", {
  stream: { write: msg => logger.info(msg.trim()) }
});

module.exports = { logger, morganMiddleware };
