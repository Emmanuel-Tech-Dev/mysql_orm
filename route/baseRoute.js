const validateTable = require("../core/middleware/validateTable");
const BaseService = require("../core/lib/baseService");
const AppError = require("../shared/helpers/AppError");
const authMiddleWare = require("../core/middleware/authMiddleWare");
const authorization = require("../core/middleware/authorization");
const { uploadSingle } = require("../core/config/multer");
const { uploadSingleFile } = require("../core/lib/uploadServices");
const uploadServices = require("../core/lib/uploadServices");
const utils = require("../shared/utils/functions");

class BaseRoute {
  constructor(app) {
    this.app = app;

    // this.init(app);

    this.findAll(app);
    this.findWithParams(app);
    this.findOne(app);
    this.create(app);
    this.createWithFile(app);
    this.uploadBulkFiles(app);
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

  createWithFile(app) {
    app.post(
      "/api/:resources/file",
      validateTable,
      uploadSingle.single("file"),
      async (req, res) => {
        const service = new BaseService(req, res);
        const table = req.params.resources;
        const file = req.file;
        const body = req.body;

        const convertBody = JSON.parse(body.body);

        // console.log(convertBody);
        // return;

        if (!file) {
          throw new AppError("ERR_BAD_REQUEST", null, {
            message: "No file uploaded",
            level: "access",
          });
        }

        const results = await uploadServices.uploadSingleFile(
          file,
          "User Profile Testing",
        );

        const dataWithFile = {
          ...convertBody,
          custom_id: utils.genRegNumber("REG"),
          avatar: results?.url,
          //file_type: data.resource_type,
          // file_storage_id: data.public_id,
        };

        if (!results) throw new AppError("ERR_FILE_UPLOAD_FAILED");
        await service.create(dataWithFile);

        res.status(201).json({
          status: "ok",
          message: "Operation Successfull!",
          details: "Resource updated successfully",
        });
      },
    );
  }

  uploadBulkFiles(app) {
    app.post(
      "/api/:resources/upload_bulk",
      validateTable,
      uploadSingle.array("files", 5),
      async (req, res) => {
        const service = new BaseService(req, res);
        const files = req.files;
        const results = await uploadServices.uploadMultipleFiles(
          files,
          "Testing",
        );

        await service.bulkCreate(results);

        res.status(201).json({
          status: "ok",
          message: "Operation Successfull!",
          details: "Resource updated successfully",
        });
      },
    );
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
