const conn = require("../config/conn");
const QueryBuilder = require("../lib/queryBuilder");
const utils = require("../../shared/utils/functions");

class Model extends QueryBuilder {
  constructor() {
    super();
    this.pool = conn; // Connection pool
    this._paginate = {};
  }

  async execute() {
    try {
      const joins = this.buildJoins();

      const finalQuery = utils.buildQuery(this.query, joins);
      const [rows] = await conn.query(finalQuery, this.params);
      // console.log("Executed SQL:", this.query);
      // console.log("With parameters:", this.params);
      // // Reset after execution for reusability
      const result = rows;
      this.reset();

      // console.log(result);
      return result;
    } catch (error) {
      console.error("Query execution error:", error);
      console.error("SQL:", this.query);
      console.error("Params:", this.params);
      throw new Error(`Database query failed: ${error.message}`);
    }
  }

  // async execute() {
  //   try {
  //     const finalQuery = this.buildQuery();
  //     const [rows] = await conn.query(finalQuery, this.params);
  //     return rows;
  //   } catch (error) {
  //     throw new Error(`Query execution failed: ${error.message}`);
  //   }
  // }

  applyQueryParams(queryParams, options = {}) {
    const {
      searchable = [],
      filterable = [],
      sortable = [],
      maxLimit = 100,
      defaultLimit = 10,
      fullTextSearch = null, // { enabled: true, columns: ['title', 'content'], table: 'articles' }
    } = options;

    // SEARCH HANDLING

    if (queryParams.search && queryParams.search.trim() !== "") {
      const searchTerm = queryParams.search.trim();

      // Option 1: Use Full-Text Search if configured
      if (queryParams.search && queryParams.search.trim() !== "") {
        const searchTerm = queryParams.search.trim();

        // Option 1: Use Full-Text Search if configured
        if (
          fullTextSearch?.enabled &&
          fullTextSearch?.columns?.length > 0 &&
          fullTextSearch?.table
        ) {
          const mode = fullTextSearch.mode || "NATURAL LANGUAGE";
          const withScore = fullTextSearch.withScore !== false; // Default true

          console.log(`✓ Using Full-Text Search on ${fullTextSearch.table}`);

          if (withScore) {
            this.fullTextSearchWithScore(
              fullTextSearch.table,
              fullTextSearch.columns,
              searchTerm,
              mode
            );

            // Auto-sort by relevance ONLY if using score AND no custom sort
            if (!queryParams.sort_by) {
              this.orderBy("id", "DESC");
            }
          } else {
            this.fullTextSearch(
              fullTextSearch.table,
              fullTextSearch.columns,
              searchTerm,
              mode
            );
            // No relevance_score column when withScore is false
          }
        }
        // Option 2: Fallback to LIKE search if searchable columns provided
        else if (searchable.length > 0) {
          console.log("✓ Using LIKE search (no full-text index)");
          const searchValue = `%${searchTerm}%`;
          const searchConditions = searchable.map((column) => ({
            column,
            operator: "LIKE",
            value: searchValue,
          }));
          this.where(searchConditions, "LIKE", "OR");
        }
        // Option 3: No search method available
        else {
          console.warn(
            "⚠ Search requested but no fullTextSearch config or searchable columns provided"
          );
        }
      }
    }

    // FILTERS (exact match)

    filterable.forEach((column) => {
      if (queryParams[column] !== undefined && queryParams[column] !== "") {
        this.where(column, "=", queryParams[column]);
      }
    });

    // SPECIAL OPERATORS

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

    // SORTING

    if (queryParams.sort_by) {
      const sortColumn = queryParams.sort_by;
      const sortOrder =
        queryParams.sort_order?.toUpperCase() === "DESC" ? "DESC" : "ASC";

      // Allow sorting by relevance_score if full-text search is active
      if (sortColumn === "relevance_score" || sortable.includes(sortColumn)) {
        this.orderBy(sortColumn, sortOrder);
      }
    }

    // PAGINATION

    const limit = Math.min(
      parseInt(queryParams.limit) || defaultLimit,
      maxLimit
    );
    const offset = parseInt(queryParams.offset) || 0;
    const page = parseInt(queryParams.page);

    if (page && page > 0) {
      this._paginate = { page, limit };
    } else if (offset > 0) {
      this._paginate = { offset, limit };
    } else {
      this._paginate = { page: 1, limit };
    }

    return this;
  }

  async paginate(page, limit) {
    // console.log(this._paginate);
    // resolve params
    const pageNum =
      page !== undefined ? parseInt(page) : this._paginate.page || 1;
    const limitNum =
      limit !== undefined ? parseInt(limit) : this._paginate.limit || 10;

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
    const result = await this.execute();

    const newResults = utils.removePasswordFromObject({ results: result });

    return {
      result: newResults.results,
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

  async tableExists(tableName) {
    const sql = `
      SELECT COUNT(*) AS count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() AND table_name = ?
    `;
    const results = await this.raw(sql, [tableName]);
    return results[0].count > 0;
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
