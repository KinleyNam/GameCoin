const { logger } = require("./logger");

function errorHandler(err, req, res, next) {
  logger.error(`${err.message} - ${req.method} ${req.originalUrl} - ${req.ip}`);
  if (process.env.NODE_ENV !== "production") {
    return res.status(err.status || 500).json({ error: err.message, stack: err.stack });
  }
  return res.status(err.status || 500).json({ error: "Internal Server Error" });
}

module.exports = errorHandler;
