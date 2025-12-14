const { LRUCache } = require("lru-cache");
const _ = require("lodash");

class CacheManager {
  constructor(options = {}) {
    this.cache = new LRUCache({
      max: options.maxItems || 1000,
      ttl: options.ttl || 1000 * 60 * 15, // 15 minutes default
      updateAgeOnGet: true,
      updateAgeOnHas: true,
    });

    // Track access patterns
    this.accessTracker = new Map();
    this.dormancyThreshold = options.dormancyThreshold || 1000 * 60 * 60; // 1 hour
    this.cleanupInterval = options.cleanupInterval || 1000 * 60 * 10; // 10 minutes

    // Start cleanup scheduler
    this.startCleanupScheduler();
  }

  set(key, value, customTtl) {
    const ttl = customTtl || this.cache.ttl;
    const now = Date.now();

    // Store in cache
    this.cache.set(key, value, { ttl });

    // Track access
    this.accessTracker.set(key, {
      lastAccessed: now,
      accessCount: this.accessTracker.get(key)?.accessCount + 1 || 1,
      created: this.accessTracker.get(key)?.created || now,
    });
  }

  get(key) {
    const value = this.cache.get(key);

    if (value) {
      // Update access tracking
      const tracking = this.accessTracker.get(key);
      if (tracking) {
        tracking.lastAccessed = Date.now();
        tracking.accessCount++;
      }
    }

    return value;
  }

  // Find dormant entries using lodash
  getDormantEntries() {
    const now = Date.now();
    const dormantEntries = {};

    // Get all tracking data
    const trackingData = Object.fromEntries(this.accessTracker);

    // Use lodash to filter dormant entries
    const dormantKeys = _.chain(trackingData)
      .pickBy((data, key) => {
        const timeSinceLastAccess = now - data.lastAccessed;
        return (
          timeSinceLastAccess > this.dormancyThreshold && this.cache.has(key)
        );
      })
      .keys()
      .value();

    // Build dormant entries object
    dormantKeys.forEach((key) => {
      dormantEntries[key] = {
        data: this.cache.get(key),
        tracking: trackingData[key],
        dormantFor: now - trackingData[key].lastAccessed,
      };
    });

    return dormantEntries;
  }

  // Clean up dormant entries
  cleanupDormantEntries() {
    const dormantEntries = this.getDormantEntries();
    const dormantKeys = Object.keys(dormantEntries);
    if (dormantKeys?.length > 0) {
      console.log(`Cleaning up ${dormantKeys.length} dormant cache entries`);

      dormantKeys.forEach((key) => {
        this.cache.delete(key);
        this.accessTracker.delete(key);
      });
    }

    return dormantKeys.length;
  }

  // Get cache analytics using lodash
  getAnalytics() {
    const now = Date.now();
    const trackingData = Array.from(this.accessTracker.entries()).map(
      ([key, data]) => ({
        key,
        ...data,
        age: now - data.created,
        timeSinceLastAccess: now - data.lastAccessed,
      })
    );

    return {
      totalEntries: this.cache.size,

      // Most accessed entries
      mostAccessed: _.chain(trackingData)
        .orderBy(["accessCount"], ["desc"])
        .take(10)
        .value(),

      // Recently accessed entries
      recentlyAccessed: _.chain(trackingData)
        .orderBy(["lastAccessed"], ["desc"])
        .take(10)
        .value(),

      // Access patterns
      accessStats: {
        totalAccesses: _.sumBy(trackingData, "accessCount"),
        averageAccesses: _.meanBy(trackingData, "accessCount"),
        medianAccesses: this.getMedian(trackingData.map((d) => d.accessCount)),
      },

      // Dormancy stats
      dormancyStats: {
        dormantCount: _.filter(
          trackingData,
          (d) => d.timeSinceLastAccess > this.dormancyThreshold
        ).length,
        averageAge: _.meanBy(trackingData, "age"),
        oldestEntry: _.maxBy(trackingData, "age"),
      },
    };
  }

  // Group entries by access patterns
  groupByAccessPattern() {
    const trackingData = Array.from(this.accessTracker.values());

    return _.groupBy(trackingData, (data) => {
      if (data.accessCount > 10) return "high-frequency";
      if (data.accessCount > 3) return "medium-frequency";
      return "low-frequency";
    });
  }

  // Find patterns using lodash
  findAccessPatterns() {
    const now = Date.now();
    const trackingData = Object.fromEntries(this.accessTracker);

    return {
      // Group by key patterns
      keyPatterns: _.chain(trackingData)
        .keys()
        .groupBy((key) => key.split(":")[0]) // Group by prefix (e.g., 'user:', 'product:')
        .mapValues((keys) => ({
          count: keys.length,
          totalAccesses: _.sumBy(keys, (key) => trackingData[key].accessCount),
          averageAccesses: _.meanBy(
            keys,
            (key) => trackingData[key].accessCount
          ),
        }))
        .value(),

      // Hot and cold data
      hotKeys: _.chain(trackingData)
        .pickBy((data) => now - data.lastAccessed < 1000 * 60 * 5) // Last 5 minutes
        .keys()
        .value(),

      coldKeys: _.chain(trackingData)
        .pickBy((data) => now - data.lastAccessed > 1000 * 60 * 30) // Over 30 minutes
        .keys()
        .value(),
    };
  }

  // Start automatic cleanup
  startCleanupScheduler() {
    this.cleanupTimer = setInterval(() => {
      this.cleanupDormantEntries();
    }, this.cleanupInterval);
  }

  // Stop cleanup scheduler
  stopCleanupScheduler() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
  }

  // Utility method for median calculation
  getMedian(numbers) {
    const sorted = _.sortBy(numbers);
    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    }

    return sorted[middle];
  }

  // Standard cache methods
  has(key) {
    return this.cache.has(key);
  }

  delete(key) {
    this.accessTracker.delete(key);
    return this.cache.delete(key);
  }

  clear() {
    this.accessTracker.clear();
    this.cache.clear();
  }

  // Graceful shutdown
  shutdown() {
    this.stopCleanupScheduler();
    this.clear();
  }
}

// Usage Example

// // Example usage in Express app
// const express = require("express");
// const app = express();

module.exports = CacheManager;
