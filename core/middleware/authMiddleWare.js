const log = require("../../shared/helpers/logger");
const tokenBlacklist = require("../../shared/helpers/tokenBlacklist");
const utils = require("../../shared/utils/functions");
const BaseService = require("../lib/baseService");
const Model = require("../model/model");

const authMiddleWare = async (req, res, next) => {
  try {
    // const user = req.user;
    let token = req.headers.authorization;
    let decodedToken;

    const service = new BaseService();

    if (!token) {
      logger.access("ERR_TOKEN_INVALID", {
        error: {
          code: error.code,
          message: error.message,
          status: 401,
        },
        route: req.originalUrl,
        method: req.method,
        ip: req.ip,
      });
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        details: "Authentication failed , please login in again",
      });
    }

    if (token.startWith("Bearer ")) {
      token = token.slice(7).trim();
      decodedToken = await utils.verifyToken(token);
    }

    if (!decodedToken) {
      logger.access("ERR_TOKEN_INVALID", {
        error: {
          code: error.code,
          message: error.message,
          status: 401,
        },
        route: req.originalUrl,
        method: req.method,
        ip: req.ip,
      });
      return res.status(401).json({
        success: false,
        message: "Unauthorized , invalid token",
        details: "Authentication failed , please login in again",
      });
    }

    if (tokenBlacklist.isAccessTokenBlacklisted(decodedToken?.jti)) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Token is revoked" });
    }
    // const checkUser = await service.findOne(user);

    // if (!checkUser) {
    //   log.access("ERR_AUTH_USER_INVALID", {
    //     error: {
    //       code: error.code,
    //       message: error.message,
    //       status: 401,
    //       user: user?.id,
    //     },
    //     route: req.originalUrl,
    //     method: req.method,
    //     ip: req.ip,
    //   });

    //   res.status(401).json({
    //     success: false,
    //     message: "Operation failed!",
    //     details: "Authentication failed , please login in again",
    //   });
    // }
    req.user = decodedToken;
    next();
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
      message: "Operation failed!",
      details: "An error occurred while processing your request.",
    });
  }
};

module.exports = authMiddleWare;
