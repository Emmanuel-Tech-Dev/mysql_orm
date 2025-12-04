const conn = require("../../core/config/conn");
const QueryBuilder = require("../../core/lib/queryBuilder");

class Model extends QueryBuilder {
  constructor() {
    super();
    this.pool = conn; // Connection pool
    this._paginate = {};
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

  applyQueryParams(queryParams, options = {}) {
    const {
      searchable = [],
      filterable = [],
      sortable = [],
      maxLimit = 100,
      defaultLimit = 20,
    } = options;

    // console.log(options);
    // Handle search (LIKE queries)
    if (queryParams.search && searchable.length > 0) {
      const searchValue = `%${queryParams.search}%`;
      const searchConditions = searchable.map((column) => ({
        column,
        operator: "LIKE",
        value: searchValue,
      }));
      this.where(searchConditions, "LIKE", "OR");
    }

    // Handle filters (exact match)
    //useCase: ?column_name=value&column_name2=value
    filterable.forEach((column) => {
      if (queryParams[column] !== undefined && queryParams[column] !== "") {
        this.where(column, "=", queryParams[column]);
      }
    });

    // Handle special operators (column_min, column_max, etc.)
    Object.keys(queryParams).forEach((key) => {
      // Handle min/max range filters
      if (key.endsWith("_min")) {
        const column = key.replace("_min", "");
        if (filterable.includes(column)) {
          this.where(column, ">=", queryParams[key]);
        }
      }
      if (key.endsWith("_max")) {
        const column = key.replace("_max", "");
        if (filterable.includes(column)) {
          this.where(column, "<=", queryParams[key]);
        }
      }

      // Handle IN queries (column_in=val1,val2,val3)
      if (key.endsWith("_in")) {
        const column = key.replace("_in", "");
        if (filterable.includes(column)) {
          const values = queryParams[key].split(",").map((v) => v.trim());
          this.whereIn(column, values);
        }
      }

      // Handle NOT IN queries
      if (key.endsWith("_not_in")) {
        const column = key.replace("_not_in", "");
        if (filterable.includes(column)) {
          const values = queryParams[key].split(",").map((v) => v.trim());
          this.whereNotIn(column, values);
        }
      }

      // Handle LIKE queries (column_like)
      if (key.endsWith("_like")) {
        const column = key.replace("_like", "");
        if (filterable.includes(column) || searchable.includes(column)) {
          this.whereLike(column, `%${queryParams[key]}%`);
        }
      }
    });

    // Handle sorting
    if (queryParams.sort_by) {
      const sortColumn = queryParams.sort_by;
      const sortOrder =
        queryParams.sort_order?.toUpperCase() === "DESC" ? "DESC" : "ASC";

      if (sortable.includes(sortColumn)) {
        this.orderBy(sortColumn, sortOrder);
      }
    }

    // Handle pagination
    const limit = Math.min(
      parseInt(queryParams.limit) || defaultLimit,
      maxLimit
    );
    const offset = parseInt(queryParams.offset) || 0;
    const page = parseInt(queryParams.page);

    if (page && page > 0) {
      // If page is provided, calculate offset from page number
      //   this.limit(limit);
      //   this.offset((page - 1) * limit);
      this._paginate = { page, limit };
    } else {
      // Use direct offset
      //   this.limit(limit);
      if (offset > 0) {
        // this.offset(offset);
        this._paginate = { offset, limit };
      }
    }

    return this;
  }

  async paginate(page, limit) {
    // console.log(this._paginate);
    // resolve params
    const pageNum =
      page !== undefined ? parseInt(page) : this._paginate.page || 1;
    const limitNum =
      limit !== undefined ? parseInt(limit) : this._paginate.limit || 20;

    if (!pageNum || !limitNum) {
      throw new Error(
        "Pagination parameters not set. Please use applyQueryParams first."
      );
    }

    // Clone current query to count total
    const countQuery = this.query;
    const countParams = [...this.params];

    // Get total count (without LIMIT / OFFSET)
    const totalQuery = countQuery.replace(
      /SELECT .+ FROM/i,
      "SELECT COUNT(*) as total FROM"
    );

    const [countResult] = await this.pool.query(totalQuery, countParams);
    const total = countResult[0].total;

    // Apply pagination
    const offset = (pageNum - 1) * limitNum;
    this.limit(limitNum).offset(offset);

    // Execute paginated query
    const data = await this.execute();

    return {
      data,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1,
      },
    };
  }

  // Execute raw SQL query

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

  // Get first row only

  async first() {
    this.limit(1);
    const results = await this.execute();
    return results.length > 0 ? results[0] : null;
  }

  // Get count of rows

  async count(column = "*") {
    const originalQuery = this.query;
    this.query = this.query.replace(
      /SELECT .+ FROM/,
      `SELECT COUNT(${column}) as count FROM`
    );
    const result = await this.execute();
    return result[0].count;
  }

  //Check if record exists

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
