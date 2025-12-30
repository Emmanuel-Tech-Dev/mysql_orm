const AppError = require("../../shared/helpers/AppError");

const errorHandler = (logger) => {
  return (err, req, res, next) => {
    // Set defaults for non-AppError instances
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";
    err.errorCode = err.errorCode || "ERR_INTERNAL_SERVER";

    // Build context for logging
    const logContext = {
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get("user-agent"),
      userId: req.user?.id,
      body: req.body,
      params: req.params,
      query: req.query,
      ...(err.metadata || {}),
    };

    // Use smartError for operational errors, regular error for unexpected ones
    if (err.isOperational) {
      logger.smartError(err, logContext, err?.metadata?.level);
    } else {
      // Log unexpected errors with full stack trace
      logger.error(err, {
        ...logContext,
        errorType: "UNEXPECTED_ERROR",
        isOperational: false,
      });
    }

    // Don't leak error details in production for non-operational errors
    if (process.env.NODE_ENV === "production" && !err.isOperational) {
      return res.status(500).json({
        status: "error",
        errorCode: "ERR_INTERNAL_SERVER",
        message: "Something went wrong. Please try again later.",
      });
    }

    // Send error response
    const response = {
      status: err.status,
      errorCode: err.errorCode,
      message: err.message,
    };

    // Add metadata/details if present
    if (err.metadata && Object.keys(err.metadata).length > 0) {
      response.details = err.metadata;
    }

    // Add stack trace in development
    if (process.env.NODE_ENV === "development") {
      response.stack = err.stack;
    }

    res.status(err.statusCode).json(response);
  };
};

module.exports = errorHandler;
