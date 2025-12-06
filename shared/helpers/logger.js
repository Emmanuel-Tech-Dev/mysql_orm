const winston = require("winston");
const path = require("path");
require("winston-daily-rotate-file");
const fs = require("fs");

// Environment configuration with validation
const ENV = process.env.NODE_ENV || "development";
const LOG_LEVEL =
  process.env.LOG_LEVEL || (ENV === "production" ? "info" : "debug");
const LOG_PATH =
  process.env.LOG_PATH || path.join(__dirname, "../../resources/logs");

// Log type definitions with metadata
const LOG_TYPES = Object.freeze({
  access: { file: "access-%DATE%.log", level: "http", category: "access" },
  error: { file: "error-%DATE%.log", level: "error", category: "error" },
  query: { file: "query-%DATE%.log", level: "verbose", category: "query" },
  security: {
    file: "security-%DATE%.log",
    level: "warn",
    category: "security",
  },
  performance: {
    file: "performance-%DATE%.log",
    level: "debug",
    category: "performance",
  },
  app: { file: "app-%DATE%.log", level: "info", category: "app" },
});

class LoggerService {
  constructor() {
    this.transports = new Map();
    this.logger = null;
    this.initialized = false;
    this.initPromise = null;
  }

  async initialize() {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this._initializeInternal();
    await this.initPromise;
    this.initialized = true;
  }

  async _initializeInternal() {
    try {
      // Ensure log directory exists
      await fs.promises.mkdir(LOG_PATH, { recursive: true });

      // Custom format with structured data
      const structuredFormat = winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
        winston.format.errors({ stack: true }),
        winston.format.metadata({
          fillExcept: ["message", "level", "timestamp", "label"],
        }),
        winston.format.json()
      );

      // Human-readable console format
      const consoleFormat = winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.colorize(),
        winston.format.printf(
          ({ timestamp, level, message, category, ...meta }) => {
            const cat = category ? `[${category.toUpperCase()}]` : "";
            const metaStr = Object.keys(meta).length
              ? `\n${JSON.stringify(meta, null, 2)}`
              : "";
            return `${timestamp} ${level} ${cat} ${message}${metaStr}`;
          }
        )
      );

      // Base logger setup
      this.logger = winston.createLogger({
        level: LOG_LEVEL,
        format: structuredFormat,
        defaultMeta: { service: "api", environment: ENV },
        transports: [],
        exitOnError: false,
      });

      // Console transport for non-production
      if (ENV !== "production") {
        this.logger.add(
          new winston.transports.Console({
            format: consoleFormat,
            handleExceptions: true,
            handleRejections: true,
          })
        );
      }

      // Combined log file for all levels
      this.logger.add(
        new winston.transports.DailyRotateFile({
          filename: path.join(LOG_PATH, "combined-%DATE%.log"),
          datePattern: "YYYY-MM-DD",
          zippedArchive: true,
          maxSize: "20m",
          maxFiles: "14d",
          format: structuredFormat,
        })
      );

      // Exception and rejection handlers
      this.logger.exceptions.handle(
        new winston.transports.DailyRotateFile({
          filename: path.join(LOG_PATH, "exceptions-%DATE%.log"),
          datePattern: "YYYY-MM-DD",
          maxSize: "20m",
          maxFiles: "14d",
        })
      );

      this.logger.rejections.handle(
        new winston.transports.DailyRotateFile({
          filename: path.join(LOG_PATH, "rejections-%DATE%.log"),
          datePattern: "YYYY-MM-DD",
          maxSize: "20m",
          maxFiles: "14d",
        })
      );
    } catch (err) {
      console.error("Failed to initialize logger:", err);
      throw new Error(`Logger initialization failed: ${err.message}`);
    }
  }

  ensureTransport(type) {
    if (!LOG_TYPES[type]) {
      throw new Error(`Invalid log type: ${type}`);
    }

    if (this.transports.has(type)) return;

    const config = LOG_TYPES[type];
    const transport = new winston.transports.DailyRotateFile({
      filename: path.join(LOG_PATH, config.file),
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
      level: config.level,
      format: winston.format.json(),
    });

    this.logger.add(transport);
    this.transports.set(type, transport);
  }

  log(type, message, metadata = {}) {
    if (!this.initialized) {
      console.warn("Logger not initialized. Call initialize() first.");
      return;
    }

    try {
      this.ensureTransport(type);
      const config = LOG_TYPES[type];

      this.logger.log(config.level, message, {
        category: config.category,
        ...metadata,
      });
    } catch (err) {
      console.error("Logging error:", err);
    }
  }

  // Convenience methods with typed metadata

  access(message, meta = {}) {
    this.log("access", message, meta);
  }

  error(error, meta = {}) {
    if (error instanceof Error) {
      this.log("error", error.message, {
        stack: error.stack,
        name: error.name,
        ...meta,
      });
    } else {
      this.log("error", error, meta);
    }
  }

  query(message, meta = {}) {
    this.log("query", message, meta);
  }

  security(message, meta = {}) {
    this.log("security", message, meta);
  }

  performance(message, meta = {}) {
    this.log("performance", message, meta);
  }

  app(message, meta = {}) {
    this.log("app", message, meta);
  }

  startTimer(label) {
    const start = Date.now();
    return (metadata = {}) => {
      const duration = Date.now() - start;
      this.performance(`${label} completed`, {
        operation: label,
        duration: `${duration}ms`,
        ...metadata,
      });
      return duration;
    };
  }

  async close() {
    if (this.logger) {
      return new Promise((resolve) => {
        this.logger.close(() => {
          this.initialized = false;
          resolve();
        });
      });
    }
  }
}

// Singleton instance
const loggerService = new LoggerService();

// Auto-initialize on first import
loggerService.initialize().catch((err) => {
  console.error("Logger auto-initialization failed:", err);
});

module.exports = loggerService;
