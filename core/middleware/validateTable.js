const loggerService = require("../../shared/helpers/logger");
const Model = require("../model/model");

async function validateTable(req, res, next) {
  try {
    const tableName = req.params.resources;
    const exists = await new Model().tableExists(tableName);

    if (!exists) {
      loggerService.smartError(
        new Error("Table doesnt exist in the database"),
        {
          status: 404,
          table: tableName,
          hint: "database",
          message: `Resource table "${tableName}" does not exist`,
          route: req.originalUrl,
          method: req.method,
          ip: req.ip,
        }
      );

      return res.status(404).json({
        success: false,
        message: "Resource not available",
      });
    }

    // Table is valid → proceed to controller
    next();
  } catch (error) {
    loggerService.smartError(new Error("failed to validate table"), {
      status: 404,
      hint: "validation",
      message: "Resource table validation failed",
      route: req.originalUrl,
      method: req.method,
      ip: req.ip,
    });

    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
}

module.exports = validateTable;
