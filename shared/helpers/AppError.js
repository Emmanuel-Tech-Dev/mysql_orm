const ERROR_CODES = require("../helpers/erroCodes");

class AppError extends Error {
  constructor(errorCode, customMessage = null, metadata = {}) {
    const errorInfo = ERROR_CODES[errorCode];

    if (!errorInfo) {
      throw new Error(`Invalid error code: ${errorCode}`);
    }

    const message = customMessage || errorInfo.message;
    super(message);

    this.errorCode = errorCode;
    this.statusCode = errorInfo.status;
    this.status = `${errorInfo.status}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    this.metadata = metadata;

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      status: this.status,
      errorCode: this.errorCode,
      message: this.message,
      ...(this.metadata &&
        Object.keys(this.metadata).length > 0 && {
          details: this.metadata,
        }),
    };
  }
}

module.exports = AppError;
