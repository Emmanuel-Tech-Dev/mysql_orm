const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const NodeCache = require("node-cache");
const { v4: uuidv4 } = require("uuid");
const otp = require("otp");

const ENCRYPTION_KEY = Buffer.from(
  process.env.ENCRYPTION_KEY,
  process.env.KEY_HOOK
); // Must be 32 bytes
const IV_LENGTH = 16;

const cache = new NodeCache({ stdTTL: 3600 });

const utils = {
  encrypt: (text) => {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return `${iv.toString("hex")}:${encrypted}`;
  },

  decrypt: (encryptedText) => {
    const [iv, encrypted] = encryptedText.split(":");
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      ENCRYPTION_KEY,
      Buffer.from(iv, "hex")
    );
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  },
  convertArrayToObject(arr) {
    if (!arr || !arr.record) {
      // Return the input object as is, or handle the error
      return arr;
    }

    const recordValues = Object.values(arr.record);

    if (recordValues.length === 0) {
      return { record: null };
    }

    return {
      ...arr,
      record: recordValues[0],
    };
  },

  removePasswordFromObject(data) {
    const clone = structuredClone(data);

    const removePassword = (obj) => {
      if (obj && typeof obj === "object") {
        if (obj.password) {
          delete obj.password;
        }
        // Recursively check all properties
        Object.keys(obj).forEach((key) => {
          if (Array.isArray(obj[key])) {
            obj[key] = obj[key].map((item) => removePassword(item));
          } else if (obj[key] && typeof obj[key] === "object") {
            removePassword(obj[key]);
          }
        });
      }
      return obj;
    };

    // Handle direct array input
    if (Array.isArray(clone)) {
      return clone.map((item) => removePassword(item));
    }

    // Handle object input
    return removePassword(clone);
  },

  buildQuery(query, buildJoins) {
    let finalQuery = query;
    const joinsClause = buildJoins;

    if (joinsClause) {
      // Find where to insert the JOIN clause
      const fromMatch = finalQuery.match(/FROM\s+\w+/i);

      if (fromMatch) {
        const fromEndIndex = fromMatch.index + fromMatch[0].length;

        // Find the next clause after FROM (WHERE, ORDER BY, LIMIT, etc.)
        const afterFrom = finalQuery.substring(fromEndIndex);
        const whereMatch = afterFrom.match(/\s+WHERE\s+/i);
        const orderMatch = afterFrom.match(/\s+ORDER BY\s+/i);
        const limitMatch = afterFrom.match(/\s+LIMIT\s+/i);
        const offsetMatch = afterFrom.match(/\s+OFFSET\s+/i);
        const havingMatch = afterFrom.match(/\s+HAVING\s+/i);
        const groupMatch = afterFrom.match(/\s+GROUP BY\s+/i);

        // Find the earliest clause
        let insertPoint = finalQuery.length;

        if (whereMatch && whereMatch.index !== -1) {
          insertPoint = Math.min(insertPoint, fromEndIndex + whereMatch.index);
        }
        if (groupMatch && groupMatch.index !== -1) {
          insertPoint = Math.min(insertPoint, fromEndIndex + groupMatch.index);
        }
        if (havingMatch && havingMatch.index !== -1) {
          insertPoint = Math.min(insertPoint, fromEndIndex + havingMatch.index);
        }
        if (orderMatch && orderMatch.index !== -1) {
          insertPoint = Math.min(insertPoint, fromEndIndex + orderMatch.index);
        }
        if (limitMatch && limitMatch.index !== -1) {
          insertPoint = Math.min(insertPoint, fromEndIndex + limitMatch.index);
        }
        if (offsetMatch && offsetMatch.index !== -1) {
          insertPoint = Math.min(insertPoint, fromEndIndex + offsetMatch.index);
        }

        // If no clauses found, insert at the end (right after FROM table)
        if (insertPoint === finalQuery.length) {
          insertPoint = fromEndIndex;
        }

        finalQuery =
          finalQuery.slice(0, insertPoint) +
          joinsClause +
          finalQuery.slice(insertPoint);
      }
    }

    return finalQuery;
  },
  generateCustomId(prefix = "USR", length = 6) {
    const uuid = uuidv4().replace(/-/g, "");
    const hexPart = uuid.slice(0, 12); // take first 12 hex characters
    const numeric = parseInt(hexPart, 16).toString().slice(0, length); // convert to number, take first N digits

    return `${prefix}-${numeric}`;
  },

  generateToken: (payload, secret, expiresIn) => {
    // Generate unique JTI if not provided
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
  },

  generateAuthTokens: (user) => {
    // Generate unique JTIs for each token
    const accessJti = uuidv4();
    const refreshJti = uuidv4();

    const basePayload = {
      id: user.id,
      custom_id: user.custom_id,
      email: user.email,
    };

    // Create access token with its own JTI
    const accessToken = Utilities.generateToken(
      {
        ...basePayload,
        jti: accessJti,
        type: "access", // Optional: identify token type
      },
      process.env.JWT_SECRET,
      "15m"
    );

    // Create refresh token with its own JTI
    const refreshToken = Utilities.generateToken(
      {
        ...basePayload,
        jti: refreshJti,
        type: "refresh", // Optional: identify token type
      },
      process.env.REFRESH_TOKEN_SECRET,
      "7d"
    );

    return {
      accessToken,
      refreshToken,
    };
  },

  generateStudentTokens: (student) => {
    const payload = {
      id: student.id,
      name: student.name,
      index_number: student.index_number,
      hall_id: student.hall_affiliate, // Include hall_id if necessary
      role: process.env.STUDENT_ROLE,
    };

    return {
      accessToken: Utilities.generateToken(
        payload,
        process.env.JWT_SECRET,
        "15m"
      ),
      refreshToken: Utilities.generateToken(
        payload,
        process.env.REFRESH_TOKEN_SECRET,
        "7d"
      ),
    };
  },

  verifyToken: async (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // console.log("Decoded access token:", {
      //   jti: decoded.jti,
      //   exp: decoded.exp,
      //   iat: decoded.iat,
      //   expiresAt: new Date(decoded.exp * 1000).toLocaleString(),
      // });
      return decoded;
    } catch (error) {
      console.error("Access token verification failed:", error.message);
      return null;
    }
  },

  verifyRefreshToken: async (token) => {
    try {
      const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
      // console.log("Decoded refresh token:", {
      //   jti: decoded.jti,
      //   exp: decoded.exp,
      //   iat: decoded.iat,
      //   expiresAt: new Date(decoded.exp * 1000).toLocaleString(),
      // });
      return decoded;
    } catch (error) {
      console.error("Refresh token verification failed:", error.message);
      return null;
    }
  },
  hashPassword: async (password) => {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  },

  comparePassword: async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
  },

  generateOtpSecret() {
    const secret = otp.utils.generateKey();
    return secret;
  },
  generateOtpCode(secret) {
    const code = otp.totp.gen(secret);
    return code;
  },
  verifyOtp(inputCode, secret) {
    const isValidOtp = otp.totp.check(inputCode, secret);
    return isValidOtp;
  },

  sendOtpPin: async (email, html, subject) => {
    const transpoter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender address
      to: email, // List of recipients
      subject: subject,
      html: html,
    };

    await transpoter.sendMail(mailOptions);
  },
  getFileType(mimetype) {
    if (mimetype.startsWith("image/")) return "image";
    if (mimetype.startsWith("video/")) return "video";
    return "unknown";
  },
};
module.exports = utils;
