const logger = require("./logger"); // Assumes this points to the LoggerService module you provided

const ERROR_CODES = Object.freeze({
  // Client Errors (4xx)
  ERR_BAD_REQUEST: { status: 400, message: "Bad request" },
  ERR_VALIDATION_FAILED: { status: 400, message: "Validation failed" },
  ERR_INVALID_INPUT: { status: 400, message: "Invalid input provided" },
  ERR_MISSING_REQUIRED_FIELD: {
    status: 400,
    message: "Missing required field",
  },
  ERR_INVALID_FORMAT: { status: 400, message: "Invalid format" },

  ERR_UNAUTHORIZED: { status: 401, message: "Unauthorized" },
  ERR_INVALID_CREDENTIALS: { status: 401, message: "Invalid credentials" },
  ERR_TOKEN_EXPIRED: { status: 401, message: "Token expired" },
  ERR_TOKEN_INVALID: { status: 401, message: "Invalid token" },
  ERR_AUTHENTICATION_REQUIRED: {
    status: 401,
    message: "Authentication required",
  },

  ERR_FORBIDDEN: { status: 403, message: "Forbidden" },
  ERR_ACCESS_DENIED: { status: 403, message: "Access denied" },
  ERR_INSUFFICIENT_PERMISSIONS: {
    status: 403,
    message: "Insufficient permissions",
  },
  ERR_ACCOUNT_SUSPENDED: { status: 403, message: "Account suspended" },

  ERR_NOT_FOUND: { status: 404, message: "Resource not found" },
  ERR_USER_NOT_FOUND: { status: 404, message: "User not found" },
  ERR_RECORD_NOT_FOUND: { status: 404, message: "Record not found" },
  ERR_ENDPOINT_NOT_FOUND: { status: 404, message: "Endpoint not found" },

  ERR_CONFLICT: { status: 409, message: "Conflict" },
  ERR_DUPLICATE_ENTRY: { status: 409, message: "Duplicate entry" },
  ERR_RESOURCE_ALREADY_EXISTS: {
    status: 409,
    message: "Resource already exists",
  },
  ERR_EMAIL_ALREADY_EXISTS: { status: 409, message: "Email already exists" },

  ERR_UNPROCESSABLE_ENTITY: { status: 422, message: "Unprocessable entity" },
  ERR_BUSINESS_LOGIC_ERROR: { status: 422, message: "Business logic error" },

  ERR_TOO_MANY_REQUESTS: { status: 429, message: "Too many requests" },
  ERR_RATE_LIMIT_EXCEEDED: { status: 429, message: "Rate limit exceeded" },

  // Server Errors (5xx)
  ERR_INTERNAL_SERVER: { status: 500, message: "Internal server error" },
  ERR_UNEXPECTED_ERROR: { status: 500, message: "Unexpected error occurred" },

  ERR_NOT_IMPLEMENTED: { status: 501, message: "Not implemented" },
  ERR_FEATURE_NOT_AVAILABLE: { status: 501, message: "Feature not available" },

  ERR_BAD_GATEWAY: { status: 502, message: "Bad gateway" },
  ERR_EXTERNAL_SERVICE_ERROR: {
    status: 502,
    message: "External service error",
  },

  ERR_SERVICE_UNAVAILABLE: { status: 503, message: "Service unavailable" },
  ERR_DATABASE_UNAVAILABLE: { status: 503, message: "Database unavailable" },
  ERR_MAINTENANCE_MODE: { status: 503, message: "System under maintenance" },

  ERR_GATEWAY_TIMEOUT: { status: 504, message: "Gateway timeout" },
  ERR_REQUEST_TIMEOUT: { status: 504, message: "Request timeout" },

  // Database Errors
  ERR_DATABASE_ERROR: { status: 500, message: "Database error" },
  ERR_QUERY_FAILED: { status: 500, message: "Query execution failed" },
  ERR_CONNECTION_FAILED: { status: 503, message: "Database connection failed" },
  ERR_TRANSACTION_FAILED: { status: 500, message: "Transaction failed" },

  // File/Upload Errors
  ERR_FILE_TOO_LARGE: { status: 413, message: "File too large" },
  ERR_INVALID_FILE_TYPE: { status: 400, message: "Invalid file type" },
  ERR_FILE_UPLOAD_FAILED: { status: 500, message: "File upload failed" },

  // Payment Errors
  ERR_PAYMENT_FAILED: { status: 402, message: "Payment failed" },
  ERR_INSUFFICIENT_FUNDS: { status: 402, message: "Insufficient funds" },
  ERR_PAYMENT_GATEWAY_ERROR: { status: 502, message: "Payment gateway error" },
});

/**
 * Custom Application Error Class
 *
 * It extends the native Error class and adds properties for
 * HTTP status, error code, and operational status.
 */
class AppError extends Error {
  constructor(code, details = null, originalError = null) {
    const errorDef = ERROR_CODES[code];

    if (!errorDef) {
      // Fallback for invalid error codes, treated as programming errors
      const fallbackDef = ERROR_CODES.ERR_INTERNAL_SERVER;
      logger.error(`Attempted to create AppError with invalid code: ${code}`);

      super(`Invalid AppError code used: ${code}. ${fallbackDef.message}`);
      this.status = fallbackDef.status;
      this.code = "ERR_INTERNAL_SERVER";
      this.name = "AppError";
      this.isOperational = false;
    } else {
      super(errorDef.message);
      this.name = "AppError";
      this.code = code;
      this.status = errorDef.status;
      this.isOperational = true;
    }

    this.details = details;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert error to JSON response format
   */
  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        status: this.status,
        details: this.details,
        timestamp: this.timestamp,
      },
    };
  }

  /**
   * Get log metadata for use with the structured logger
   */
  getLogMetadata() {
    return {
      code: this.code,
      status: this.status,
      details: this.details,
      stack: this.stack,
      // Log the original error message and stack if available
      originalError: this.originalError
        ? {
            message: this.originalError.message,
            // Include the stack of the underlying error for better debugging
            stack: this.originalError.stack,
          }
        : undefined,
      timestamp: this.timestamp,
      isOperational: this.isOperational,
    };
  }
}

/**
 * Error Factory Functions
 */
const ErrorFactory = {
  // Client Errors
  badRequest: (details) => new AppError("ERR_BAD_REQUEST", details),
  validationFailed: (details) => new AppError("ERR_VALIDATION_FAILED", details),
  invalidInput: (field, details) =>
    new AppError("ERR_INVALID_INPUT", { field, ...details }),
  missingField: (field) =>
    new AppError("ERR_MISSING_REQUIRED_FIELD", { field }),

  unauthorized: (details) => new AppError("ERR_UNAUTHORIZED", details),
  invalidCredentials: () => new AppError("ERR_INVALID_CREDENTIALS"),
  tokenExpired: () => new AppError("ERR_TOKEN_EXPIRED"),
  tokenInvalid: () => new AppError("ERR_TOKEN_INVALID"),

  forbidden: (details) => new AppError("ERR_FORBIDDEN", details),
  accessDenied: (resource) => new AppError("ERR_ACCESS_DENIED", { resource }),
  insufficientPermissions: (required) =>
    new AppError("ERR_INSUFFICIENT_PERMISSIONS", { required }),

  notFound: (resource) => new AppError("ERR_NOT_FOUND", { resource }),
  userNotFound: (identifier) =>
    new AppError("ERR_USER_NOT_FOUND", { identifier }),
  recordNotFound: (table, id) =>
    new AppError("ERR_RECORD_NOT_FOUND", { table, id }),

  conflict: (details) => new AppError("ERR_CONFLICT", details),
  duplicateEntry: (field, value) =>
    new AppError("ERR_DUPLICATE_ENTRY", { field, value }),
  emailExists: (email) => new AppError("ERR_EMAIL_ALREADY_EXISTS", { email }),

  tooManyRequests: (retryAfter) =>
    new AppError("ERR_TOO_MANY_REQUESTS", { retryAfter }),

  // Server Errors
  internalServer: (details, originalError) =>
    new AppError("ERR_INTERNAL_SERVER", details, originalError),
  databaseError: (operation, originalError) =>
    new AppError("ERR_DATABASE_ERROR", { operation }, originalError),
  queryFailed: (query, originalError) =>
    new AppError("ERR_QUERY_FAILED", { query }, originalError),

  serviceUnavailable: (service) =>
    new AppError("ERR_SERVICE_UNAVAILABLE", { service }),
  externalServiceError: (service, originalError) =>
    new AppError("ERR_EXTERNAL_SERVICE_ERROR", { service }, originalError),

  // File Errors
  fileTooLarge: (maxSize) => new AppError("ERR_FILE_TOO_LARGE", { maxSize }),
  invalidFileType: (allowedTypes) =>
    new AppError("ERR_INVALID_FILE_TYPE", { allowedTypes }),

  // Payment Errors
  paymentFailed: (reason) => new AppError("ERR_PAYMENT_FAILED", { reason }),
  insufficientFunds: (required, available) =>
    new AppError("ERR_INSUFFICIENT_FUNDS", { required, available }),
};

/**
 * Central Error Handler for Logging and Response Generation
 */
class ErrorHandler {
  constructor(logger) {
    this.logger = logger;
  }

  /**
   * Process a raw error to log it and return a standardized AppError instance.
   */
  handle(error, context = {}) {
    if (error instanceof AppError) {
      // 1. Operational errors - Log at 'error' level with full structured metadata
      this.logger.error(error.message, {
        ...error.getLogMetadata(),
        ...context,
      });
      return error;
    }

    // 2. Programming errors (unexpected) - Wrap and log full details
    const internalAppError = new AppError(
      "ERR_INTERNAL_SERVER",
      { originalMessage: error.message },
      error
    );
    // Explicitly flag it as non-operational for the log/response logic
    internalAppError.isOperational = false;
    internalAppError.status = 500; // Ensure 500 status code

    // Log the full programming error details, including the actual stack
    this.logger.error("Unexpected error occurred (Programming Error)", {
      ...internalAppError.getLogMetadata(),
      ...context,
      // Ensure the actual stack of the raw error is logged
      stack: error.stack,
      name: error.name,
      isOperational: false,
    });

    // Return the wrapped error for response generation
    return internalAppError;
  }

  /**
   * Express Error Middleware (4-argument signature)
   */
  middleware() {
    // eslint-disable-next-line no-unused-vars
    return (err, req, res, next) => {
      // 1. Handle error and get the standard AppError object
      const handledError = this.handle(err, {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userId: req.user?.id, // Assumes user might be attached to req
      });

      // 2. Specialized logging for Auth errors (using the dedicated 'security' transport)
      if (handledError.status === 401 || handledError.status === 403) {
        this.logger.security("Authentication/Authorization failure", {
          code: handledError.code,
          ip: req.ip,
          url: req.originalUrl,
          userId: req.user?.id,
        });
      }

      // 3. Determine response details
      let responseStatus = handledError.status;
      let responsePayload = handledError.toJSON();

      // For non-operational (programming) errors, we respond with a generic 500 message
      // and hide internal details for security.
      if (!handledError.isOperational || handledError.status >= 500) {
        responseStatus = 500;
        responsePayload = ErrorFactory.internalServer().toJSON();
      }

      res.status(responseStatus).json(responsePayload);
    };
  }

  /**
   * Async route wrapper to safely catch errors and pass them to the Express error middleware.
   */
  asyncHandler(fn) {
    return (req, res, next) => {
      // Ensures that any error (sync or async) is caught and passed to the next()
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }
}

/**
 * Database Error Mapper
 * Maps common database errors to standard AppError codes.
 */
const mapDatabaseError = (error) => {
  // Example for PostgreSQL error codes (adjust for your specific DB)
  if (error.code === "23505") {
    // Unique violation
    return ErrorFactory.duplicateEntry(error.constraint, error.detail);
  }
  if (error.code === "23503") {
    // Foreign key violation
    return ErrorFactory.badRequest({
      reason: "Referenced record does not exist",
    });
  }
  if (error.code === "23502") {
    // Not null violation
    return ErrorFactory.missingField(error.column);
  }

  // Fallback for other database errors
  return ErrorFactory.databaseError(error.routine || "Unknown", error);
};

// ---

module.exports = {
  ERROR_CODES,
  AppError,
  ErrorFactory,
  ErrorHandler,
  mapDatabaseError,
};
