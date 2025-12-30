const CacheManager = require("../../shared/helpers/cacheManager");
const Model = require("../model/model");
const conn = require("../config/conn");

const cache = new CacheManager();

class SettingsManager {
  constructor() {
    this.cache = new CacheManager({
      maxItems: 500,
      ttl: 0, // No TTL - settings never expire
      dormancyThreshold: Infinity,
      cleanupInterval: 0,
    });

    this.isPreload = false;
    this.cachePrefix = "setting:";
    this.environment = "dev";
  }

  async get(key, defaultValue = null) {
    try {
      const cacheKey = `${this.cachePrefix}${key}`;
      const cached = this.cache.get(cacheKey);

      if (cached !== undefined) {
        return cached;
      }

      // Not in cache - fetch from database
      const value = await this.fetchFromDB(key);

      if (value !== null) {
        this.cache.set(cacheKey, value, 0);
        return value;
      }

      return defaultValue;
    } catch (error) {
      console.log(` Error getting setting ${key}:`, error.message);
      return defaultValue;
    }
  }

  async fetchFromDB(key) {
    const data = await new Model()
      .setSql(
        `SELECT value, type, scope
       FROM system_settings 
       WHERE \`key\` = '${key}' 
       AND (env = '${this.environment}' OR env IS NULL OR scope = 'global')
       ORDER BY 
         CASE 
           WHEN env = '${this.environment}' THEN 0 
           WHEN scope = 'global' THEN 1 
           ELSE 2 
         END
       LIMIT 1`
      )
      .execute();

    if (data.length === 0) return null;

    return this.convertType(data[0].value, data[0].type);
  }

  convertType(value, dataType) {
    if (value === null || value === undefined) return null;

    switch (dataType) {
      case "number":
        return parseFloat(value);

      case "boolean":
        if (typeof value === "boolean") return value;
        return ["true", "1", "yes"].includes(String(value).toLowerCase());

      case "json":
        try {
          return typeof value === "string" ? JSON.parse(value) : value;
        } catch (err) {
          console.error("Error parsing JSON:", err);
          return null;
        }

      case "string":
      default:
        return String(value);
    }
  }

  async set(key, value, changedBy = "dev") {
    const connection = await conn.getConnection();
    try {
      await connection.beginTransaction();

      const [current] = await connection.query(
        "SELECT * FROM settings WHERE `key` = ?",
        [key]
      );

      if (current.length === 0) {
        throw new Error(`Setting ${key} not found`);
      }

      const oldValue = current[0].value;
      const newValue = String(value);

      // Update database
      await connection.query(
        "UPDATE settings SET value = ?, updated_at = NOW() WHERE `key` = ?",
        [newValue, key]
      );

      await connection.commit();

      // Update cache immediately
      const cacheKey = `${this.cachePrefix}${key}`;
      const typedValue = this.convertType(newValue, current[0].type);
      this.cache.set(cacheKey, typedValue, 0);

      console.log(`✅ Setting updated: ${key} = ${newValue} by ${changedBy}`);

      return {
        success: true,
        key,
        oldValue,
        newValue: typedValue,
      };
    } catch (err) {
      await connection.rollback();
      throw new Error("connection failed try again");
    } finally {
      connection.release();
    }
  }

  async preloadAll() {
    console.log("Preloading all settings into cache...");

    try {
      const rows = await new Model()
        .setSql(
          `SELECT \`key\`, value, type 
         FROM system_settings 
         WHERE env = '${this.environment}' OR env IS NULL OR scope = 'global'`
        )
        .execute();

      // console.log(rows);

      // return;

      let count = 0;
      for (const row of rows) {
        const cacheKey = `${this.cachePrefix}${row.key}`;
        const value = this.convertType(row.value, row.type);
        this.cache.set(cacheKey, value, 0);
        count++;
      }

      this.isPreloaded = true;
      console.log(` Preloaded ${count} settings into cache`);
      console.log(
        ` Settings cached FOREVER (until server restart or admin update)`
      );

      return count;
    } catch (error) {
      console.error(" Error preloading settings:", error);
      throw error;
    }
  }

  getAll(key) {
    const settings = this.cache.get("settings:");
  }

  getAnalytics() {
    return {
      cacheSize: this.cache.cache.size,
      isPreloaded: this.isPreloaded,
      analytics: this.cache.getAnalytics(),
    };
  }
}

// async function systemSettings(tableName) {
//   try {
//     const res = await new Model().select(["*"], tableName).execute();
//     if (res?.length == 0) {
//       throw new Error("System setup up failed");
//     }
//     cache.set("settings:all", res, null);
//   } catch (error) {
//     console.log(error);
//     throw new Error("Failed to get system settings configuration");
//   }
// }

// function getSetting(key, defaultValue = null) {
//   const settings = cache.get("settings:all");
//   if (!settings || !(key in settings)) {
//     return defaultValue;
//   }
//   return settings[key];
// }

module.exports = SettingsManager;
