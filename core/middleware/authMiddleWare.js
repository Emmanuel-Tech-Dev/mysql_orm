const AppError = require("../../shared/helpers/AppError");

const AuthService = require("../lib/authService");
const Model = require("../model/model");

const authMiddleWare = async (req, res, next) => {
  const auth = new AuthService();
  let token = req.headers.authorization;
  let decodedToken;

  const tokenIssuer = await auth.tokenIssuerInit();

  if (!token) {
    throw new AppError("ERR_TOKEN_INVALID", null, {
      message: "Authenication failed! Try again later",
      level: "access",
    });
  }

  if (token.startsWith("Bearer ")) {
    token = token.slice(7).trim();
    decodedToken = await auth.verifyToken(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );
  }

  if (!decodedToken) {
    throw new AppError("ERR_TOKEN_INVALID", null, {
      message: "Authenication failed! Try again later",
      level: "access",
    });
  }

  // await checkTokenVersion(decodedToken);

  if (decodedToken?.iss !== tokenIssuer) {
    throw new AppError("ERR_TOKEN_INVALID", "Token issuer mismatch", {
      message: "Authenication failed! Try again later",
      level: "access",
    });
  }

  const [oldToken] = await new Model()
    .select(["token_version"], "admin_credentials")
    .where("admin_custom_id", "=", decodedToken?.sub)
    .execute();

  if (decodedToken?.token_version !== oldToken?.token_version) {
    throw new AppError("ERR_TOKEN_EXPIRED", null, {
      message: "Authenication failed! Try again later",
      level: "access",
    });
  }

  req.user = decodedToken;

  // if (err.name === "TokenExpiredError") {
  //   throw new AppError("ERR_TOKEN_EXPIRED", null, {
  //     message: "Token has expired",
  //     level: "access",
  //   });
  // }

  next();
};

async function checkTokenVersion(decodedToken) {
  const [oldToken] = await new Model()
    .select(["token_version"], "admin_credentials")
    .where("admin_custom_id", "=", decodedToken?.sub)
    .execute();

  if (oldToken?.token_version !== decodedToken?.token_version)
    throw new AppError("ERR_TOKEN_EXPIRED", null, {
      message: "Authenication failed! Try again later",
      level: "access",
    });
}

module.exports = authMiddleWare;
