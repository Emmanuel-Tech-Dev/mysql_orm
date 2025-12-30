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
  ERR_RATE_LIMIT_EXCEEDED: { status: 429, message: "Rate limit exceeded" }, // Server Errors (5xx)
  ERR_UNAUTHORIZED: { status: 401, message: "Unauthorized" },
  ERR_INVALID_CREDENTIALS: { status: 401, message: "Invalid credentials" },
  ERR_TOKEN_EXPIRED: { status: 401, message: "Token expired" },
  ERR_TOKEN_REVOKED: { status: 401, message: "Token revoked or blacklisted" },
  ERR_TOKEN_INVALID: { status: 401, message: "Invalid token" },
  ERR_AUTH_USER_INVALID: { status: 401, message: "Auth user not found" },
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
  ERR_NOT_FOUND: { status: 404, message: "Resource not found" },
  ERR_USER_NOT_FOUND: { status: 404, message: "User not found" },

  ERR_NO_RESOURCES: { status: 403, message: "No resources available" },

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

module.exports = ERROR_CODES;
