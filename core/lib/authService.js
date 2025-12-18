const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const NodeCache = require("node-cache");
const { v4: uuidv4 } = require("uuid");
const otp = require("otp");

class AuthService {
  constructor() {
    this.accessTtl = 300; // this will change from settings
    this.refreshTTL = 300;
  }

  _generateToken(payload, secret, expiresIn) {
    const jti = payload.jti || uuidv4();

    return jwt.sign(
      payload, // Your custom payload
      secret,
      {
        expiresIn, // This sets the 'exp' claim automatically
        // jti: jti, // This sets the 'jti' claim in JWT standard claims
        issuer: "your-issuer", // Optional: set issuer
        // audience: "your-users", // Optional: set audience
      }
    );
  }
}

module.exports = AuthService;
