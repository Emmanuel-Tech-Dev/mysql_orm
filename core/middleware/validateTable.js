const Model = require("../model/model");

async function validateTable(req, res, next) {
  try {
    const tableName = req.params.resources;
    const exists = await new Model().tableExists(tableName);

    if (!exists) {
      //   logger.error(`Invalid table access attempt: "${tableName}"`, {
      //     url: req.originalUrl,
      //     user: req.user?.id,
      //   });

      return res.status(404).json({
        success: false,
        message: "Resource not available",
      });
    }

    // Table is valid → proceed to controller
    next();
  } catch (error) {
    // logger.error("Table validation error", {
    //   error: error.message,
    //   stack: error.stack,
    // });

    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
}

module.exports = validateTable;
