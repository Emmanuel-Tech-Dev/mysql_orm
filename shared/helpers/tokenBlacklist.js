class TokenBlacklist {
  constructor(options = {}) {
    this.accessTokens = new Map();
    this.refreshTokens = new Map();

    const {
      accessTokenCleanupInterval = 5 * 60 * 1000, // 5 minutes (good for 15-minute access tokens)
      refreshTokenCleanupInterval = 60 * 60 * 1000, // 1 hour (good for 7-day refresh tokens)
      enableAdaptiveCleanup = true,
    } = options;

    this.accessCleanupInterval = setInterval(() => {
      this._cleanupExpiredTokens("access");
    }, accessTokenCleanupInterval);

    this.refreshCleanupInterval = setInterval(() => {
      this._cleanupExpiredTokens("refresh");
    }, refreshTokenCleanupInterval);

    if (enableAdaptiveCleanup) {
      this.adaptiveCleanupInterval = setInterval(() => {
        this._adaptiveCleanup();
      }, 5 * 60 * 1000); // Check every 5 minutes
    }

    // console.log(`TokenBlacklist initialized:
    //   - Access token cleanup: every ${accessTokenCleanupInterval / 1000}s
    //   - Refresh token cleanup: every ${refreshTokenCleanupInterval / 1000}s
    //   - Adaptive cleanup: ${enableAdaptiveCleanup ? "enabled" : "disabled"}`);
  }

  blacklistAccessToken(jti, decodedToken) {
    if (!jti) {
      console.error("Cannot blacklist access token: missing JTI");
      throw new Error("Cannot blacklist access token: missing JTI");
    }

    // Use the token's actual expiry time (15 minutes for your case)
    const expiry = decodedToken?.exp
      ? decodedToken?.exp * 1000
      : Date.now() + 15 * 60 * 1000;
    this.accessTokens.set(jti, expiry);

    // console.log(
    //   `Access token blacklisted: ${jti}, expires at: ${new Date(
    //     expiry
    //   ).toLocaleString()}`
    // );
  }

  blacklistRefreshToken(jti, expiresInSec = 7 * 24 * 60 * 60) {
    if (!jti) {
      console.error("Cannot blacklist refresh token: missing JTI");
      throw new Error("Cannot blacklist refresh token: missing JTI");
    }

    const expiry = Date.now() + expiresInSec * 1000;
    this.refreshTokens.set(jti, expiry);

    // console.log(
    //   `Refresh token blacklisted: ${jti}, expires at: ${new Date(
    //     expiry
    //   ).toLocaleString()}`
    // );
  }

  isAccessTokenBlacklisted(jti) {
    if (!jti) return false;

    const expiry = this.accessTokens.get(jti);
    if (!expiry) return false;

    // Check if token has expired and cleanup immediately
    if (Date.now() > expiry) {
      this.accessTokens.delete(jti);
      console.log(`Expired access token removed from blacklist: ${jti}`);
      return false;
    }

    return true;
  }

  isRefreshTokenBlacklisted(jti) {
    if (!jti) return false;

    const expiry = this.refreshTokens.get(jti);
    if (!expiry) return false;

    // Check if token has expired and cleanup immediately
    if (Date.now() > expiry) {
      this.refreshTokens.delete(jti);
      // console.log(`Expired refresh token removed from blacklist: ${jti}`);
      return false;
    }

    return true;
  }

  _adaptiveCleanup() {
    const totalTokens = this.accessTokens.size + this.refreshTokens.size;

    // If we have more than 10,000 tokens, clean up more aggressively
    if (totalTokens > 10000) {
      console.log(
        `Large blacklist detected (${totalTokens} tokens), running full cleanup`
      );
      this._cleanupExpiredTokens("both");
    }
    // If we have more than 50,000 tokens, something might be wrong
    else if (totalTokens > 50000) {
      console.warn(
        `Very large blacklist (${totalTokens} tokens) - consider investigating`
      );
      this._cleanupExpiredTokens("both");
    }
  }

  _cleanupExpiredTokens(type = "both") {
    const now = Date.now();
    let accessCleaned = 0;
    let refreshCleaned = 0;

    if (type === "access" || type === "both") {
      for (const [jti, expiry] of this.accessTokens.entries()) {
        if (expiry <= now) {
          this.accessTokens.delete(jti);
          accessCleaned++;
        }
      }
    }

    if (type === "refresh" || type === "both") {
      for (const [jti, expiry] of this.refreshTokens.entries()) {
        if (expiry <= now) {
          this.refreshTokens.delete(jti);
          refreshCleaned++;
        }
      }
    }

    if (accessCleaned > 0 || refreshCleaned > 0) {
      console.log(
        `Blacklist cleanup (${type}): ${accessCleaned} access tokens, ${refreshCleaned} refresh tokens removed`
      );
    }
  }

  getStats() {
    const now = Date.now();
    let expiredAccess = 0;
    let expiredRefresh = 0;

    // Count expired tokens
    for (const expiry of this.accessTokens.values()) {
      if (expiry <= now) expiredAccess++;
    }
    for (const expiry of this.refreshTokens.values()) {
      if (expiry <= now) expiredRefresh++;
    }

    return {
      accessTokens: {
        total: this.accessTokens.size,
        expired: expiredAccess,
        active: this.accessTokens.size - expiredAccess,
      },
      refreshTokens: {
        total: this.refreshTokens.size,
        expired: expiredRefresh,
        active: this.refreshTokens.size - expiredRefresh,
      },
      totalActive:
        this.accessTokens.size -
        expiredAccess +
        (this.refreshTokens.size - expiredRefresh),
    };
  }

  forceCleanup() {
    const statsBefore = this.getStats();
    this._cleanupExpiredTokens("both");
    const statsAfter = this.getStats();

    console.log("Force cleanup completed:");
    console.log(
      `Access tokens: ${statsBefore.accessTokens.total} → ${statsAfter.accessTokens.total}`
    );
    console.log(
      `Refresh tokens: ${statsBefore.refreshTokens.total} → ${statsAfter.refreshTokens.total}`
    );
  }

  stopCleanup() {
    if (this.accessCleanupInterval) {
      clearInterval(this.accessCleanupInterval);
      this.accessCleanupInterval = null;
    }
    if (this.refreshCleanupInterval) {
      clearInterval(this.refreshCleanupInterval);
      this.refreshCleanupInterval = null;
    }
    if (this.adaptiveCleanupInterval) {
      clearInterval(this.adaptiveCleanupInterval);
      this.adaptiveCleanupInterval = null;
    }
    console.log("All TokenBlacklist cleanup intervals stopped");
  }

  shutdown() {
    this.stopCleanup();
    this.accessTokens.clear();
    this.refreshTokens.clear();
    console.log("TokenBlacklist shutdown complete");
  }
}

const tokenBlacklist = new TokenBlacklist({
  accessTokenCleanupInterval: 5 * 60 * 1000, // 5 minutes (1/3 of 15-minute lifetime)
  refreshTokenCleanupInterval: 60 * 60 * 1000, // 1 hour
  enableAdaptiveCleanup: true,
});

// Graceful shutdown handlers
process.on("SIGTERM", () => {
  tokenBlacklist.shutdown();
});

process.on("SIGINT", () => {
  tokenBlacklist.shutdown();
});

module.exports = tokenBlacklist;
