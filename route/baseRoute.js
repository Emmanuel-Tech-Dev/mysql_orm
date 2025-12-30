const validateTable = require("../core/middleware/validateTable");
const BaseService = require("../core/lib/baseService");
const loggerService = require("../shared/helpers/logger");
const { response } = require("express");
const AppError = require("../shared/helpers/AppError");
const authMiddleWare = require("../core/middleware/authMiddleWare");
const authorization = require("../core/middleware/authorization");

class BaseRoute {
  constructor(app) {
    this.app = app;

    this.init(app);

    this.findAll(app);
    this.findWithParams(app);
    this.findOne(app);
    this.create(app);
    this.bulkCreate(app);
    this.update(app);
    this.updateSome(app);
    this.delete(app);

    return this;
  }

  async init(app) {
    app.use(authMiddleWare);
    app.use(authorization);
  }

  findAll(app) {
    app.get("/api/:resources", validateTable, async (req, res) => {
      const service = new BaseService(req, res);
      const data = await service.findAll();
      res.status(200).json({
        status: "ok",
        message: "Operation Successful!",
        data: data,
      });
    });
  }

  findWithParams(app) {
    // Support both GET and POST for query endpoint. GET is handy for URL-based filters
    app.post("/api/:resources/query", validateTable, async (req, res) => {
      const service = new BaseService(req, res);

      const data = await service.findAllWithParams(req.body || {});

      res.status(200).json({
        status: "ok",
        message: "Operation Successful!",
        data: data,
      });
    });
    // app.get("/api/:resources/query", validateTable, handler);
  }

  findOne(app) {
    app.get("/api/:resources/:id", async (req, res) => {
      const service = new BaseService();
      const data = await service.findOne(req.params);
      if (!data) {
        throw new AppError("ERR_NOT_FOUND");
      }

      res.status(200).json({
        status: "ok",
        message: "Operation Successfull!",
        // details: "Resource created successfully",
        data: data,
      });
    });
  }

  create(app) {
    app.post("/api/:resources", validateTable, async (req, res) => {
      const service = new BaseService(req, res);

      if (!req.body) {
        // loggerService.smartError(new Error("Missing required fields"), {
        //     status : 400,

        // })
        throw new AppError("ERR_BAD_REQUEST");
      }
      await service.create(req.body);

      res.status(201).json({
        status: "ok",
        message: "Operation Successfull!",
        details: "Resource created successfully",
      });
    });
  }

  bulkCreate(app) {
    app.post("/api/:resources/bulk", validateTable, async (req, res) => {
      const service = new BaseService(req, res);
      // console.log(req.body, req.params.resources);

      if (!req.body) {
        throw new AppError("ERR_BAD_REQUEST");
      }

      await service.bulkCreate(req.body);

      return res.status(201).json({
        status: "ok",
        message: "Operation Successfull!",
        details: "Resource created successfully",
      });
    });
  }

  update(app) {
    app.put("/api/:resources/:id", validateTable, async (req, res) => {
      const service = new BaseService(req, res);

      const data = await service.findOne(req.params);
      if (!data) {
        throw new AppError("ERR_NOT_FOUND");
      }

      await service.updateRecord(req.body);

      res.status(201).json({
        status: "ok",
        message: "Operation Successfull!",
        details: "Resource updated successfully",
      });
    });
  }
  updateSome(app) {}

  delete(app) {
    app.delete("/api/:resources/:id", validateTable, async (req, res) => {
      // console.log(req.params);
      // const {id} = req.params
      // return;
      const service = new BaseService(req, res);

      const data = await service.findOne(req.params);
      if (!data) {
        throw new AppError("ERR_NOT_FOUND");
      }

      await service.deleteRecord(req.params);

      res.status(201).json({
        status: "ok",
        message: "Operation Successfull!",
        details: "Resource deleted successfully",
      });
    });
  }
}

module.exports = BaseRoute;
