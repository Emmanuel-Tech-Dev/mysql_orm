const otp = require("otp");
const qrcode = require("qrcode");
const crypto = require("crypto");

class OTPService {
  constructor() {
    this.rateLimitStore = new Map();
    this.maxAttempts = 5;
    this.lockoutDuration = 15 * 60 * 1000;
  }

  generateOtpSecret() {
    try {
      const buffer = crypto.randomBytes(20);
      const secret = this._base32Encode(buffer);

      if (!secret) {
        throw new Error("Failed to generate OTP secret");
      }
      return secret;
    } catch (error) {
      console.error("Error generating OTP secret:", error);
      throw new Error("Unable to generate OTP secret");
    }
  }

  _base32Encode(buffer) {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let bits = 0;
    let value = 0;
    let output = "";

    for (let i = 0; i < buffer.length; i++) {
      value = (value << 8) | buffer[i];
      bits += 8;

      while (bits >= 5) {
        output += alphabet[(value >>> (bits - 5)) & 31];
        bits -= 5;
      }
    }

    if (bits > 0) {
      output += alphabet[(value << (5 - bits)) & 31];
    }

    return output;
  }

  generateOtpCode(secret) {
    try {
      if (!secret || typeof secret !== "string") {
        throw new Error("Invalid secret provided");
      }

      const otpInstance = new otp({ secret: secret });
      const code = otpInstance.totp();

      if (!code) {
        throw new Error("Failed to generate OTP code");
      }

      return code;
    } catch (error) {
      console.error("Error generating OTP code:", error);
      throw new Error("Unable to generate OTP code");
    }
  }

  verifyOtp(inputCode, secret, userId) {
    try {
      if (!inputCode || !secret || !userId) {
        return {
          isValid: false,
          error: "Missing required parameters",
        };
      }

      if (typeof inputCode !== "string" || typeof secret !== "string") {
        return {
          isValid: false,
          error: "Invalid parameter types",
        };
      }

      const normalizedCode = inputCode.replace(/\s/g, "");
      if (!/^\d{6}$/.test(normalizedCode)) {
        return {
          isValid: false,
          error: "OTP code must be 6 digits",
        };
      }

      const rateLimitResult = this.checkRateLimit(userId);
      if (!rateLimitResult.allowed) {
        return {
          isValid: false,
          error: rateLimitResult.error,
          remainingTime: rateLimitResult.remainingTime,
        };
      }

      const otpInstance = new otp({ secret: secret });
      const currentCode = otpInstance.totp();

      let isValidOtp = normalizedCode === currentCode;

      if (!isValidOtp) {
        const previousTime = Math.floor(Date.now() / 1000) - 30;
        const previousCode = otpInstance.totp(previousTime);
        isValidOtp = normalizedCode === previousCode;
      }

      if (!isValidOtp) {
        const nextTime = Math.floor(Date.now() / 1000) + 30;
        const nextCode = otpInstance.totp(nextTime);
        isValidOtp = normalizedCode === nextCode;
      }

      this.updateRateLimit(userId, isValidOtp);

      return {
        isValid: isValidOtp,
        error: isValidOtp ? null : "Invalid OTP code",
      };
    } catch (error) {
      console.error("Error verifying OTP:", error);
      return {
        isValid: false,
        error: "OTP verification failed",
      };
    }
  }

  async generateQrCode(
    secret,
    accountName,
    serviceName = process.env.SERVICE_NAME
  ) {
    try {
      if (!secret || !accountName) {
        throw new Error("Secret and account name are required");
      }

      const otpauthUrl = `otpauth://totp/${encodeURIComponent(
        serviceName
      )}:${encodeURIComponent(
        accountName
      )}?secret=${secret}&issuer=${encodeURIComponent(serviceName)}`;

      const qrCodeDataUrl = qrcode.toDataURL(otpauthUrl, {
        errorCorrectionLevel: "M",
        type: "image/png",
        quality: 0.92,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      return qrCodeDataUrl;
    } catch (error) {
      console.error("Error generating QR code:", error);
      throw new Error("Unable to generate QR code");
    }
  }

  encryptSecret(secret, encryptionKey) {
    try {
      if (!secret || !encryptionKey) {
        throw new Error("Secret and encryption key are required");
      }

      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipher("aes-256-cbc", encryptionKey);

      let encrypted = cipher.update(secret, "utf8", "hex");
      encrypted += cipher.final("hex");

      return {
        encryptedSecret: encrypted,
        iv: iv.toString("hex"),
      };
    } catch (error) {
      console.error("Error encrypting secret:", error);
      throw new Error("Unable to encrypt secret");
    }
  }

  decryptSecret(encryptedSecret, iv, encryptionKey) {
    try {
      if (!encryptedSecret || !iv || !encryptionKey) {
        throw new Error("All parameters are required for decryption");
      }

      const decipher = crypto.createDecipher("aes-256-cbc", encryptionKey);

      let decrypted = decipher.update(encryptedSecret, "hex", "utf8");
      decrypted += decipher.final("utf8");

      return decrypted;
    } catch (error) {
      console.error("Error decrypting secret:", error);
      throw new Error("Unable to decrypt secret");
    }
  }

  checkRateLimit(userId) {
    const userAttempts = this.rateLimitStore.get(userId);

    if (!userAttempts) {
      return { allowed: true };
    }

    const now = Date.now();

    if (userAttempts.lockedUntil && now < userAttempts.lockedUntil) {
      const remainingTime = Math.ceil((userAttempts.lockedUntil - now) / 1000);
      return {
        allowed: false,
        error: `Too many failed attempts. Try again in ${remainingTime} seconds.`,
        remainingTime,
      };
    }

    if (userAttempts.lockedUntil && now >= userAttempts.lockedUntil) {
      this.rateLimitStore.delete(userId);
      return { allowed: true };
    }

    if (userAttempts.count >= this.maxAttempts) {
      userAttempts.lockedUntil = now + this.lockoutDuration;
      const remainingTime = Math.ceil(this.lockoutDuration / 1000);
      return {
        allowed: false,
        error: `Too many failed attempts. Locked out for ${remainingTime} seconds.`,
        remainingTime,
      };
    }

    return { allowed: true };
  }

  updateRateLimit(userId, isValid) {
    if (isValid) {
      this.rateLimitStore.delete(userId);
      return;
    }

    const userAttempts = this.rateLimitStore.get(userId) || { count: 0 };
    userAttempts.count += 1;
    userAttempts.lastAttempt = Date.now();

    this.rateLimitStore.set(userId, userAttempts);
  }

  getRemainingTime() {
    const now = Math.floor(Date.now() / 1000);
    const timeStep = 30;
    const remainingTime = timeStep - (now % timeStep);
    return remainingTime;
  }

  cleanupRateLimit() {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000;

    for (const [userId, attempts] of this.rateLimitStore.entries()) {
      if (attempts.lastAttempt && now - attempts.lastAttempt > maxAge) {
        this.rateLimitStore.delete(userId);
      }
    }
  }
}

// const otpService = new OTPService();

// async function setupOTP(userId, userEmail) {
//   try {
//     const secret = otpService.generateOtpSecret();
//     const qrCode = await otpService.generateQrCode(secret, userEmail, "MyApp");

//     const encryptionKey = process.env.OTP_ENCRYPTION_KEY;
//     const encryptedData = otpService.encryptSecret(secret, encryptionKey);

//     return {
//       secret,
//       qrCode,
//       encryptedData,
//     };
//   } catch (error) {
//     console.error("Setup failed:", error);
//     throw error;
//   }
// }

// function verifyLoginOTP(userId, inputCode, encryptedSecret, iv) {
//   try {
//     const encryptionKey = process.env.OTP_ENCRYPTION_KEY;
//     const secret = otpService.decryptSecret(encryptedSecret, iv, encryptionKey);

//     const result = otpService.verifyOtp(inputCode, secret, userId);
//     return result;
//   } catch (error) {
//     console.error("Verification failed:", error);
//     return { isValid: false, error: "Verification failed" };
//   }
// }

module.exports = new OTPService();
