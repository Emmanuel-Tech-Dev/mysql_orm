const express = require("express");
const responseTime = require("response-time");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimiter = require("express-rate-limit");
const bodyPaser = require("body-parser");
const morgan = require("morgan");
const csrf = require("csurf");
const helmet = require("helmet");
const http = require("http");

const fs = require("fs");
const path = require("path");
const conn = require("./core/config/conn");
const Model = require("./core/model/model");
const validateTable = require("./core/middleware/validateTable");
const AppError = require("./shared/helpers/AppError");
const logger = require("./shared/helpers/logger");
const BaseRoute = require("./route/baseRoute");
const uploadServices = require("./core/lib/uploadServices");
const { uploadSingle } = require("./core/config/multer");

const app = express();
const server = http.createServer(app);
// const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

const limiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again after 15 minutes",
});

// const io = socket(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
// });

// console.log(bodyPaser.json());

app.use(cookieParser());
app.use(express.json());
app.use(limiter);
app.use(bodyPaser.json());

app.use(bodyPaser.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(responseTime());
const allowedOrigins = [
  "http://localhost:3001",
  "http://localhost:5173",
  "https://my-production-app.com",
  "https://staging-app.com",
];

// app.use((err, req, res, next) => {
//   logger.error(err.message);
//   res.status(err.status || 500).json({ error: err.message });
// });

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    optionsSuccessStatus: 200,
  })
);

// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader(
//     "Access-Control-Allow-Methods",
//     "GET, POST, PUT, DELETE , PATCH"
//   );
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type");
//   next();
// });
app.use(helmet());
app.get("/favicon.ico", (req, res) => res.status(204));
// app.use(express.static("../frontend/build"));
// const publicPath = path.resolve(__dirname, "resources/adphotos");
// const voiceNotePath = path.resolve(__dirname, "resources/voicenotes");
// const msgImgPath = path.resolve(__dirname, "resources/msgimages");
// const sysImgPath = path.resolve(__dirname, "resources/sysimg");
// const usersImgPath = path.resolve(__dirname, "resources/users");
// const pdfsFilePath = path.resolve(__dirname, "resources/pdfs");

// const staticFilesOptions = {};
// app.get("/:pic", express.static(publicPath, staticFilesOptions));
// app.get("/:voice", express.static(voiceNotePath, staticFilesOptions));
// app.get("/:img", express.static(msgImgPath, staticFilesOptions));
// app.get("/:img", express.static(sysImgPath, staticFilesOptions));
// app.get("/:img", express.static(usersImgPath, staticFilesOptions));
// app.get("/:pdf", express.static(pdfsFilePath, staticFilesOptions));

// app.get("*", (req, res) => {
//   res.sendFile(path.resolve("../frontend/build/index.html"));
// });
// app.use(authMiddleware);
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

new BaseRoute(app);

app.get("/", async (req, res) => {
  try {
    const [results] = await conn.query("SELECT 1 + 1 AS solution");
    console.log("The solution is: ", results[0].solution);
    res.send(`The solution is: ${results[0].solution}`);
  } catch (err) {
    console.error("Error executing query:", err);
    res.status(500).send("Error executing query");
  }
});

app.post("/api/v1/joins_data", async (req, res) => {
  try {
    const tableName = req.params.resources;
    const params = req.query;

    const { tbl1, tbl2 } = req.body;
    const data = await new Model()
      .multiSelect([
        { table: "halls", columns: ["id", "hall_name"] },
        { table: "rooms", columns: [] }, // No room columns, just for joining
      ])
      .addAggregate("SUM", "rooms.room_capacity", "total_capacity") // Won't work - need custom approach
      .join("INNER", "rooms", "halls.id", "rooms.hall_id")
      .groupBy(["halls.id", "halls.hall_name"])
      .execute();
    res.json({ success: true, data });
  } catch (error) {
    logger.access("ERR_BAD_REQUEST", {
      error: {
        code: error.code,
        message: error.message,
        status: 500,
      },
      route: req.originalUrl,
      method: req.method,
      ip: req.ip,
    });

    res.status(500).json({
      success: false,
      error: error.message,
      message: "An error occurred while processing your request.",
    });
  }
});

app.post("/api/v1/upload", uploadSingle.array("files", 5), async (req, res) => {
  try {
    const file = req.files;

    const results = await uploadServices.uploadMultipleFiles(file, "Testing");

    res.json({
      results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: "An error occurred while processing your request.",
    });
  }
});

// Remove conn.connect() and conn.end() entirely
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
