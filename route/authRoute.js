const AuthService = require("../core/lib/authService");
const SettingsManager = require("../core/lib/systemSettings");
const authMiddleWare = require("../core/middleware/authMiddleWare");
const validateRequest = require("../core/middleware/validateRequest");
const authSchema = require("../schema/auth.schema/createUserScheme");
const log = require("../shared/helpers/logger");
class AuthRoute {
  constructor(app) {
    this.app = app;
    this.auth = new AuthService();
    this.settings = new SettingsManager();
    this.refreshttl = null;
    this.login(app);
    this.createUserAccount(app);
    this.logout(app);
    this.refreshToken(app);
    this.changePassword(app);
    this.forgetPassword(app);
    this.verifyResetToken(app);
    this.resetPassword(app);
    this.googleOAuth(app);

    this.init();

    return this;
  }

  async init() {
    this.refreshTTL = await this.settings.get("auth.jwt.refresh_ttl");
  }

  login(app) {
    app.post("/auth/login", async (req, res) => {
      const record = req.body;

      const response = await this.auth.login(record);

      // res.cookie("refresh_token", response?.refreshToken, {
      //   httpOnly: true,
      //   secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      //   sameSite: "strict", // Strict CSRF protection
      //   maxAge: this.refreshttl, // 7 days
      // });

      res
        .status(200)
        .cookie("refresh_token", response?.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production", // Use secure cookies in production
          sameSite: "strict", // Strict CSRF protection
          maxAge: this.refreshttl, // 7 days
        })
        .json({
          status: "ok",
          message: "Operation Successfull!",
          token: response?.accessToken,
        });
    });
  }

  logout(app) {
    app.post("/auth/logout", async (req, res) => {
      const token = req.cookies.refresh_token;
      await this.auth.logout(token);
      // res.clearCookie("refresh_token", {
      //   httpOnly: true,
      //   secure: process.env.NODE_ENV === "production",
      //   sameSite: "strict",
      // });

      res.status(201).clearCookie("refresh_token").json({
        status: "ok",
        message: "Operation Successfull!",
        detalis: "User logout",
      });
    });
  }

  createUserAccount(app) {
    app.post(
      "/auth/register",
      validateRequest(authSchema.register),
      async (req, res) => {
        const record = req.body;
        await this.auth.createAdminUser(record);
        res.status(201).json({
          status: "ok",
          message: "Operation Successfull!",
          detalis: "User created successfully",
        });
      }
    );
  }

  refreshToken(app) {
    app.post("/auth/refresh", async (req, res) => {
      const token = req.cookies.refresh_token;
      const response = await this.auth.refreshToken(token);

      // res.cookie("refresh_token", response?.refreshToken, {
      //   httpOnly: true,
      //   secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      //   sameSite: "strict", // Strict CSRF protection
      //   maxAge: this.refreshttl, // 7 days
      // });

      res
        .status(200)
        .cookie("refresh_token", response?.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production", // Use secure cookies in production
          sameSite: "strict", // Strict CSRF protection
          maxAge: this.refreshttl, // 7 days
        })
        .json({
          status: "ok",
          message: "Operation Successfull!",
          token: response?.accessToken,
        });
    });
  }

  changePassword(app) {
    app.post("/auth/change_password", authMiddleWare, async (req, res) => {
      const record = req.body;
      const { sub } = req.user;

      const response = await this.auth.changePassword({
        ...record,
        userID: sub,
      });

      // res.cookie("refresh_token", response?.refreshToken, {
      //   httpOnly: true,
      //   secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      //   sameSite: "strict", // Strict CSRF protection
      //   maxAge: this.refreshttl, // 7 days
      // });

      res
        .status(200)
        .cookie("refresh_token", response?.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production", // Use secure cookies in production
          sameSite: "strict", // Strict CSRF protection
          maxAge: this.refreshttl, // 7 days
        })
        .json({
          status: "ok",
          message: "Operation Successfull!",
          token: response?.accessToken,
        });
    });
  }

  forgetPassword(app) {
    app.post("/auth/forget_password", async (req, res) => {
      const record = req.body;
      //   {sub}

      const response = await this.auth.forgetPassword(record);
      if (response) {
        log.security("Forget Password change init", {
          // userId: user.id,
          // regNumber: user.reg_number,
          // email: user.email,
          ip: req?.ip,
          userAgent: req?.get("user-agent"),
          timestamp: new Date().toISOString(),
        });
      }

      res.status(201).json({
        status: "ok",
        message: "Operation Successfull!",
        details: "Please check email for reset link",
      });
    });
  }

  verifyResetToken(app) {
    app.get("/auth/verify_reset_token", async (req, res) => {
      const token = req.query.token;

      const result = await this.auth.verifyPasswordResetToken(token);

      if (result) {
        log.security("Reset Password token verified", {
          ip: req?.ip,
          userAgent: req?.get("user-agent"),
          timestamp: new Date().toISOString(),
        });
      }

      res.status(201).json({
        status: "ok",
        message: "Operation Successfull!",
        details: "Token verified , Proceed to the reset password",
      });
    });
  }

  resetPassword(app) {
    app.post("/auth/reset_password", async (req, res) => {
      const { token } = req.query;
      const { password } = req.body;

      const response = await this.auth.resetPassword(token, password);

      if (response) {
        log.security("Password Reset successfully", {
          ip: req?.ip,
          userAgent: req?.get("user-agent"),
          timestamp: new Date().toISOString(),
        });
      }

      res.status(201).json({
        status: "ok",
        message: "Operation Successfull!",
        details: "Password reset successfully , You can now login",
      });
    });
  }

  googleOAuth(app) {
    app.post("/auth/google_oauth", async (req, res) => {
      const record = req.body;

      const response = await this.auth.googleOAuth(record);

      // res.cookie("refresh_token", response?.refreshToken, {
      //   httpOnly: true,
      //   secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      //   sameSite: "strict", // Strict CSRF protection
      //   maxAge: this.refreshttl, // 7 days
      // });

      res
        .status(200)
        .cookie("refresh_token", response?.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production", // Use secure cookies in production
          sameSite: "strict", // Strict CSRF protection
          maxAge: this.refreshttl, // 7 days
        })
        .json({
          status: "ok",
          message: "Operation Successfull!",
          token: response?.accessToken,
        });
    });
  }
}

module.exports = AuthRoute;
