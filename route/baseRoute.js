const validateTable = require("../core/middleware/validateTable");
const BaseService = require("../core/lib/baseService");
const loggerService = require("../shared/helpers/logger");

class BaseRoute {
  constructor(app) {
    this.app = app;
    this.findAll(app);
    this.findWithParams(app);
    this.create(app);
    this.bulkCreate(app);
    this.update(app);
    this.updateSome(app);
    this.delete(app);
    return this;
  }

  findAll(app) {
    app.get("/api/:resources", validateTable, async (req, res) => {
      try {
        console.log("HERE");
        const service = new BaseService(req, res);
        const data = await service.findAll();
        return res.status(200).json({
          success: true,
          data: data,
        });
      } catch (error) {
        // loggerService.error(new Error, {
        //   error: {
        //     code: "ERR_BAD_REQUEST",
        //     message: error.message,
        //     status: 500,
        //     stack: error.stack,
        //   },
        //   route: req.originalUrl,
        //   method: req.method,
        //   ip: req.ip,
        // });
        return res.status(500).json({
          success: false,
          message: "Something went wrong. Please try again later.",
        });
      }
    });
  }

  findWithParams(app) {
    app.post("/api/:resources/query", validateTable, async (req, res) => {
      try {
        const service = new BaseService(req, res);
        const data = await service.findAllWithParams(req.body);

        return res.status(200).json({
          success: true,
          data: data,
        });
      } catch (error) {
        // loggerService.error("ERROR_FINDING_WITH_PARAMS", {
        //   error: {
        //     code: "ERR_BAD_REQUEST",
        //     message: error.message,
        //     status: 500,
        //     stack: error.stack,
        //   },
        //   route: req.originalUrl,
        //   method: req.method,
        //   ip: req.ip,
        // });
        return res.status(500).json({
          success: false,
          message: "Something went wrong. Please try again later.",
        });
      }
    });
  }

  create(app) {
    app.post("/api/:resources", validateTable, async (req, res) => {
      try {
        const service = new BaseService(req, res);

        if (!req.body) {
          // loggerService.smartError(new Error("Missing required fields"), {
          //     status : 400,

          // })

          res.status(400).json({
            success: false,
            message: "Mission required fields",
          });
        }
        await service.create(req.body);

        return res.status(201).json({
          success: true,
          message: "Operation Successfull!",
          details: "Resource created successfully",
        });
      } catch (error) {
        loggerService.error("ERROR_CREATING_RECORDS", {
          error: {
            code: "ERR_BAD_REQUEST",
            message: error.message,
            status: 500,
            stack: error.stack,
          },
          route: req.originalUrl,
          method: req.method,
          ip: req.ip,
        });
        return res.status(500).json({
          success: false,
          message: "Something went wrong. Please try again later.",
        });
      }
    });
  }

  bulkCreate(app) {
    app.post("/api/:resources/bulk", validateTable, async (req, res) => {
      try {
        const service = new BaseService(req, res);
        // console.log(req.body, req.params.resources);

        await service.bulkCreate(req.body);

        return res.status(201).json({
          success: true,
          message: "Operation Successfull!",
          details: "Resource created successfully",
        });
      } catch (error) {
        console.log(error);
        res.status(500).json({
          success: false,
          message: "Operation failed!",
          details: "Something went wrong. Please try again later",
        });
      }
    });
  }

  update(app) {}
  updateSome(app) {}
  delete(app) {}
}

module.exports = BaseRoute;
