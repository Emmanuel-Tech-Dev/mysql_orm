const conn = require("../../core/config/conn"); // Your pool.promise()
const QueryBuilder = require("../../core/lib/queryBuilder");

class Model extends QueryBuilder {
  constructor() {
    super();
    this.pool = conn; // Connection pool
  }

  async execute() {
    try {
      const [rows] = await this.pool.query(this.query, this.params);

      // Reset after execution for reusability
      const result = rows;
      this.reset();

      return result;
    } catch (error) {
      console.error("Query execution error:", error);
      console.error("SQL:", this.query);
      console.error("Params:", this.params);
      throw new Error(`Database query failed: ${error.message}`);
    }
  }

  /**
   * Execute raw SQL query
   * @param {string} sql - SQL query string
   * @param {array} params - Query parameters
   */
  async raw(sql, params = []) {
    try {
      const [rows] = await this.pool.query(sql, params);
      return rows;
    } catch (error) {
      console.error("Raw query execution error:", error);
      console.error("SQL:", sql);
      console.error("Params:", params);
      throw new Error(`Database query failed: ${error.message}`);
    }
  }

  /**
   * Get first row only
   */
  async first() {
    this.limit(1);
    const results = await this.execute();
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Get count of rows
   */
  async count(column = "*") {
    const originalQuery = this.query;
    this.query = this.query.replace(
      /SELECT .+ FROM/,
      `SELECT COUNT(${column}) as count FROM`
    );
    const result = await this.execute();
    return result[0].count;
  }

  /**
   * Check if record exists
   */
  async exists() {
    const count = await this.count();
    return count > 0;
  }

  /**
   * Execute a transaction with multiple operations
   * @param {Function} callback - Async function containing queries
   */
  async transaction(callback) {
    const connection = await this.pool.getConnection();

    try {
      await connection.beginTransaction();

      // Pass a transaction helper object to the callback
      const txHelper = {
        query: async (sql, params = []) => {
          const [rows] = await connection.query(sql, params);
          return rows;
        },

        // Allow QueryBuilder usage in transactions
        builder: () => {
          const builder = new QueryBuilder();
          builder.executeInTransaction = async () => {
            const [rows] = await connection.query(
              builder.query,
              builder.params
            );
            builder.reset();
            return rows;
          };
          return builder;
        },
      };

      const result = await callback(txHelper);
      await connection.commit();

      return result;
    } catch (error) {
      await connection.rollback();
      console.error("Transaction error:", error);
      throw new Error(`Transaction failed: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  /**
   * Close the connection pool (call on app shutdown)
   */
  async closePool() {
    try {
      await this.pool.end();
      console.log("Connection pool closed successfully");
    } catch (error) {
      console.error("Error closing pool:", error);
      throw error;
    }
  }
}

module.exports = Model;
