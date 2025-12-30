const { z } = require("zod");
const AppError = require("../../shared/helpers/AppError");

const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      // Validate body if schema provided
      if (schema?.body) {
        req.body = schema?.body.parse(req.body);
      }

      // Validate query params if schema provided
      if (schema?.query) {
        req.query = schema?.query.parse(req.query);
      }

      // Validate URL params if schema provided
      if (schema?.params) {
        req.params = schema?.params.parse(req.params);
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Format Zod errors into readable messages

        const errors = error?.issues?.map((err) => ({
          field: err?.path.join("."),
          message: err.message,
        }));

        // Throw AppError with validation details
        throw new AppError("ERR_VALIDATION_FAILED", "Validation failed", {
          errors,
        });
      }

      // Pass other errors to error handler
      next(error);
    }
  };
};

module.exports = validateRequest;
