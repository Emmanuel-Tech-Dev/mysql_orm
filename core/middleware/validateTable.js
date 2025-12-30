const AppError = require("../../shared/helpers/AppError");
const loggerService = require("../../shared/helpers/logger");
const Model = require("../model/model");

async function validateTable(req, res, next) {
  const tableName = req.params.resources;
  const exists = await new Model().tableExists(tableName);
  //console.log("Table exists:", exists, tableName);

  if (!exists) {
    throw new AppError("ERR_BAD_REQUEST", null, {
      message: " Resource not found",
    });
  }

  // Table is valid → proceed to controller
  next();
}

module.exports = validateTable;
