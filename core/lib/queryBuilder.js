const utils = require("../../shared/utils/functions");
const conn = require("../config/conn"); // Your connection pool

class QueryBuilder {
  constructor() {
    this.query = "";
    this.params = [];
    this.type = "";
    this.joins = [];
    this.selectedTables = [];
  }

  // SELECT columns
  select(columns = "*", table) {
    if (Array.isArray(columns)) {
      this.query = `SELECT ${columns.join(", ")} from ${table}`;
    } else {
      this.query = `SELECT ${columns} from ${table}`;
    }

    return this;
  }

  // FROM table
  from(table) {
    this.query += ` FROM ${table}`;
    return this;
  }

  // WHERE condition
  where(
    columnOrConditions,
    operator = "=",
    valueOrLogic = null
    // fullTextSearch = false
  ) {
    // Handle array of conditions
    if (Array.isArray(columnOrConditions)) {
      const conditions = columnOrConditions;
      const logic = valueOrLogic || "AND"; // Default to AND

      if (conditions.length === 0) return this;

      const whereClause = this.query.includes("WHERE") ? "" : " WHERE ";
      const conditionStrings = [];

      for (let condition of conditions) {
        const col = condition.column;
        const op = condition.operator || operator;
        const val = condition.value;

        conditionStrings.push(`${col} ${op} ?`);
        this.params.push(val);
      }

      //   conditions.forEach((condition) => {
      //     const col = condition.column;
      //     const op = condition.operator || operator;
      //     const val = condition.value;

      //     conditionStrings.push(`${col} ${op} ?`);
      //     this.params.push(val);
      //   });

      if (this.query.includes("WHERE")) {
        this.query += ` ${logic} (${conditionStrings.join(` ${logic} `)})`;
      } else {
        this.query += `${whereClause}(${conditionStrings.join(` ${logic} `)})`;
      }

      console.log(this.query);
      return this;
    }

    // Handle single condition
    const column = columnOrConditions;
    const value = valueOrLogic;

    if (this.query.includes("WHERE")) {
      this.query += ` AND ${column} ${operator} ?`;
    } else {
      this.query += ` WHERE ${column} ${operator} ?`;
    }

    this.params.push(value);
    return this;
  }

  // OR WHERE condition
  orWhere(columnOrConditions, operator = "=", valueOrLogic = null) {
    // Handle array of conditions
    if (Array.isArray(columnOrConditions)) {
      const conditions = columnOrConditions;
      const logic = valueOrLogic || "OR"; // Default to OR

      if (conditions.length === 0) return this;

      const whereClause = this.query.includes("WHERE") ? "" : " WHERE ";
      const conditionStrings = [];

      conditions.forEach((condition) => {
        const col = condition.column;
        const op = condition.operator || operator;
        const val = condition.value;

        conditionStrings.push(`${col} ${op} ?`);
        this.params.push(val);
      });

      if (this.query.includes("WHERE")) {
        this.query += ` OR (${conditionStrings.join(` ${logic} `)})`;
      } else {
        this.query += `${whereClause}(${conditionStrings.join(` ${logic} `)})`;
      }

      return this;
    }

    // Handle single condition
    const column = columnOrConditions;
    const value = valueOrLogic;

    if (this.query.includes("WHERE")) {
      this.query += ` OR ${column} ${operator} ?`;
    } else {
      this.query += ` WHERE ${column} ${operator} ?`;
    }
    this.params.push(value);
    return this;
  }

  // WHERE IN - for multiple values
  // Usage: whereIn("status", ["active", "pending", "completed"])
  whereIn(column, values) {
    if (!Array.isArray(values) || values.length === 0) {
      throw new Error("Values for whereIn must be a non-empty array");
    }

    const placeholders = values.map(() => "?").join(", ");

    if (this.query.includes("WHERE")) {
      this.query += ` AND ${column} IN (${placeholders})`;
    } else {
      this.query += ` WHERE ${column} IN (${placeholders})`;
    }

    this.params.push(...values);
    return this;
  }

  // WHERE NOT IN
  //useCase: whereNotIn("status", ["inactive", "banned"])
  whereNotIn(column, values) {
    if (!Array.isArray(values) || values.length === 0) {
      throw new Error("Values for whereNotIn must be a non-empty array");
    }

    const placeholders = values.map(() => "?").join(", ");

    if (this.query.includes("WHERE")) {
      this.query += ` AND ${column} NOT IN (${placeholders})`;
    } else {
      this.query += ` WHERE ${column} NOT IN (${placeholders})`;
    }

    this.params.push(...values);
    return this;
  }

  // WHERE BETWEEN
  // Usage: whereBetween("age", 18, 65)
  whereBetween(column, min, max) {
    if (min === undefined || max === undefined) {
      throw new Error("Both min and max values are required for whereBetween");
    }
    if (this.query.includes("WHERE")) {
      this.query += ` AND ${column} BETWEEN ? AND ?`;
    } else {
      this.query += ` WHERE ${column} BETWEEN ? AND ?`;
    }
    this.params.push(min, max);
    return this;
  }

  // WHERE LIKE
  // Usage: whereLike("name", "%John%")
  //useCase: whereLike("column", "%pattern%")
  whereLike(column, pattern) {
    if (!pattern) {
      throw new Error("Pattern is required for whereLike");
    }
    if (this.query.includes("WHERE")) {
      this.query += ` AND ${column} LIKE ?`;
    } else {
      this.query += ` WHERE ${column} LIKE ?`;
    }
    this.params.push(pattern);
    return this;
  }

  // WHERE IS NULL
  //useCase: whereNull("deleted_at")
  whereNull(column) {
    if (!column) {
      throw new Error("Column name is required for whereNull");
    }
    if (this.query.includes("WHERE")) {
      this.query += ` AND ${column} IS NULL`;
    } else {
      this.query += ` WHERE ${column} IS NULL`;
    }
    return this;
  }

  // WHERE IS NOT NULL
  //useCase: whereNotNull("deleted_at")
  whereNotNull(column) {
    if (!column) {
      throw new Error("Column name is required for whereNull");
    }
    if (this.query.includes("WHERE")) {
      this.query += ` AND ${column} IS NOT NULL`;
    } else {
      this.query += ` WHERE ${column} IS NOT NULL`;
    }
    return this;
  }

  // ORDER BY
  orderBy(column, direction = "ASC") {
    this.query += ` ORDER BY ${column} ${direction}`;
    return this;
  }

  // GROUP BY
  groupBy(columns) {
    if (Array.isArray(columns)) {
      this.query += ` GROUP BY ${columns.join(", ")}`;
    } else {
      this.query += ` GROUP BY ${columns}`;
    }
    return this;
  }

  // LIMIT
  limit(count) {
    this.query += ` LIMIT ${count}`;
    return this;
  }

  limitRange(start, end) {
    if (start.toString().trim() === "")
      throw "Parameter 1 is required for limit to work";
    this.sql += ` LIMIT ${start} ${end ? "," + end : ""} `;
    return this;
  }
  setSql(sql) {
    console.log("Setting SQL:", sql);
    this.query = sql;
    return this;
  }
  getSql() {
    return this.sql;
  }

  // OFFSET
  offset(count) {
    this.query += ` OFFSET ${count}`;
    return this;
  }

  /*
   * JOIN with flexible type
   * Usage:
   *   .join("INNER", "posts", "users.id", "posts.user_id")
   *   .join("LEFT", "comments", "posts.id", "comments.post_id")
   *   .join("INNER", "posts", "users.id", "=", "posts.user_id")
   */
  join(joinType, table, column1, operator, column2) {
    const validJoinTypes = ["INNER", "LEFT", "RIGHT", "FULL", "CROSS", "JOIN"];
    const upperJoinType = joinType.toUpperCase();

    if (!validJoinTypes.includes(upperJoinType)) {
      throw new Error(
        `Invalid join type: ${joinType}. Must be one of: ${validJoinTypes.join(
          ", "
        )}`
      );
    }

    // Handle both 4 and 5 parameter versions
    let col1, op, col2;
    if (column2 !== undefined) {
      // 5 parameters: join("INNER", "posts", "users.id", "=", "posts.user_id")
      col1 = column1;
      op = operator;
      col2 = column2;
    } else {
      // 4 parameters: join("INNER", "posts", "users.id", "posts.user_id")
      col1 = column1;
      op = "=";
      col2 = operator;
    }

    this.joins.push({
      type: upperJoinType === "CROSS" ? "CROSS JOIN" : `${upperJoinType} JOIN`,
      table,
      leftColumn: col1,
      operator: op,
      rightColumn: col2,
    });

    return this;
  }

  /**
   * Build JOIN clauses into the query
   */
  buildJoins() {
    if (this.joins.length === 0) return "";

    return this.joins
      .map((join) => {
        if (join.type === "CROSS JOIN") {
          return ` ${join.type} ${join.table}`;
        }
        return ` ${join.type} ${join.table} ON ${join.leftColumn} ${join.operator} ${join.rightColumn}`;
      })
      .join("");
  }

  /**
   * MultiSelect - Select columns from multiple tables with joins
   * Usage: .multiSelect([
   *   { table: "users", columns: ["id", "name", "email"] },
   *   { table: "posts", columns: ["id", "title", "content"] }
   * ])
   * .join("INNER", "posts", "users.id", "posts.user_id")
   */
  multiSelect(tableSelections) {
    if (!Array.isArray(tableSelections) || tableSelections.length === 0) {
      throw new Error(
        "tableSelections must be a non-empty array of { table, columns } objects"
      );
    }

    const selectClauses = [];
    let mainTable = null;

    tableSelections.forEach((selection) => {
      const { table, columns } = selection;

      if (!table) {
        throw new Error("Each table selection must have a 'table' property");
      }

      if (!mainTable) {
        mainTable = table;
      }

      this.selectedTables.push(table);

      if (Array.isArray(columns)) {
        // Handle ["*"] specially
        if (columns.length === 1 && columns[0] === "*") {
          selectClauses.push(`${table}.*`);
        } else {
          // Prefix columns with table name for clarity
          const prefixedColumns = columns.map((col) => `${table}.${col}`);
          selectClauses.push(...prefixedColumns);
        }
      } else if (columns === "*") {
        selectClauses.push(`${table}.*`);
      } else {
        selectClauses.push(`${table}.${columns}`);
      }
    });

    this.query = `SELECT ${selectClauses.join(", ")} FROM ${mainTable}`;

    return this;
  }

  insert(table, data) {
    const columns = Object.keys(data);
    const values = Object.values(data);

    this.query = `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${columns
      .map(() => "?")
      .join(", ")})`;
    this.params = values;
    return this;
  }

  bulkInsert(table, dataArray) {
    if (!Array.isArray(dataArray)) {
      throw new Error("Data must be an array");
    }

    if (dataArray.length === 0) {
      throw new Error("Data array for bulk insert cannot be empty");
    }

    const allKeys = [
      ...new Set(dataArray.flatMap((record) => Object.keys(record))),
    ];

    if (allKeys.length === 0) {
      throw new Error("Records must contain at least one field");
    }

    const columns = allKeys.join(", ");

    // Use placeholders instead of direct values
    const placeholders = dataArray
      .map(() => `(${allKeys.map(() => "?").join(", ")})`)
      .join(", ");

    // Flatten all values in order
    this.params = dataArray.flatMap((record) =>
      allKeys.map((key) => record[key] ?? null)
    );

    this.query = `INSERT INTO ${table} (${columns}) VALUES ${placeholders}`;

    return this;
  }

  // UPDATE
  update(table, data) {
    const columns = Object.keys(data);
    const values = Object.values(data);

    this.query = `UPDATE ${table} SET ${columns
      .map((col) => `${col} = ?`)
      .join(", ")}`;
    this.params = values;
    return this;
  }

  // DELETE
  delete(table) {
    this.query = `DELETE FROM ${table}`;
    return this;
  }

  //useCase: aggregate("SUM", "amount", "total_amount")
  aggregate(func, column, alias = null) {
    this.type = "select";
    const upperFunc = func.toUpperCase();
    const validFunctions = ["COUNT", "SUM", "AVG", "MIN", "MAX"];

    if (!validFunctions.includes(upperFunc)) {
      throw new Error(
        `Unsupported aggregate function: ${func}. Must be one of: ${validFunctions.join(
          ", "
        )}`
      );
    }

    const functionPart = `${upperFunc}(${column})`;
    let selectClause;

    if (alias) {
      selectClause = `${functionPart} AS ${alias}`;
    } else {
      selectClause = functionPart;
    }

    this.query = `SELECT ${selectClause}`;
    // console.log(this.params, this.query);

    return this;
  }

  selectRaw(rawSql) {
    if (!this.query.includes("SELECT")) {
      throw new Error(
        "selectRaw must be called after select() or multiSelect()"
      );
    }

    // Find the FROM keyword and insert before it
    const fromIndex = this.query.toUpperCase().indexOf(" FROM ");
    if (fromIndex === -1) {
      throw new Error("Query must have a FROM clause to use selectRaw");
    }

    this.query =
      this.query.slice(0, fromIndex) +
      ", " +
      rawSql +
      this.query.slice(fromIndex);

    return this;
  }

  addAggregate(func, column, alias = null) {
    const upperFunc = func.toUpperCase();
    const validFunctions = ["COUNT", "SUM", "AVG", "MIN", "MAX"];

    if (!validFunctions.includes(upperFunc)) {
      throw new Error(
        `Unsupported aggregate function: ${func}. Must be one of: ${validFunctions.join(
          ", "
        )}`
      );
    }

    const functionPart = alias
      ? `${upperFunc}(${column}) AS ${alias}`
      : `${upperFunc}(${column})`;

    return this.selectRaw(functionPart);
  }
  //useCase :having("total_amount", ">", 1000)
  //useCase: having("COUNT(id)", ">", 5)
  having(column, operator, value) {
    if (this.query.includes("HAVING")) {
      this.query += ` AND ${column} ${operator} ?`;
    } else {
      this.query += ` HAVING ${column} ${operator} ?`;
    }
    this.params.push(value);
    return this;
  }

  // Get the raw query (for debugging)
  getSQL() {
    return {
      query: utils.buildQuery(this.query, this.buildJoins),
      params: this.params,
    };
  }

  // Reset the query builder
  reset() {
    this.query = "";
    this.params = [];
    this.joins = [];
    this.selectedTables = [];
    return this;
  }
}

// ============================================
// USAGE EXAMPLES
// ============================================

// Example 1: Simple SELECT all
async function example1() {
  const qb = new QueryBuilder();
  const users = await qb.select().from("users").execute();

  console.log("All users:", users);
}

// Example 2: SELECT specific columns with WHERE
async function example2() {
  const qb = new QueryBuilder();
  const activeUsers = await qb
    .select(["id", "name", "email"])
    .from("users")
    .where("status", "=", "active")
    .execute();

  console.log("Active users:", activeUsers);
}

// Example 3: Multiple WHERE conditions
async function example3() {
  const qb = new QueryBuilder();
  const filteredUsers = await qb
    .select()
    .from("users")
    .where("age", ">", 18)
    .where("country", "=", "USA")
    .orderBy("created_at", "DESC")
    .execute();

  console.log("Filtered users:", filteredUsers);
}

// Example 4: WHERE with OR condition
async function example4() {
  const qb = new QueryBuilder();
  const users = await qb
    .select(["id", "name", "role"])
    .from("users")
    .where("role", "=", "admin")
    .orWhere("role", "=", "moderator")
    .execute();

  console.log("Admins or moderators:", users);
}

// Example 5: Complex query with pagination
async function example5() {
  const qb = new QueryBuilder();
  const pagedUsers = await qb
    .select(["id", "name", "email", "created_at"])
    .from("users")
    .where("status", "=", "active")
    .where("verified", "=", true)
    .orderBy("created_at", "DESC")
    .limit(10)
    .offset(0)
    .execute();

  console.log("Paged users:", pagedUsers);
}

// Example 6: Debug query before execution
function example6() {
  const qb = new QueryBuilder();
  qb.select(["id", "name"])
    .from("products")
    .where("price", "<", 100)
    .where("in_stock", "=", true);

  const { query, params } = qb.getSQL();
  console.log("Query:", query);
  console.log("Params:", params);
}

// Example 7: INNER JOIN - Users with their posts
async function example7() {
  const qb = new QueryBuilder();
  const usersWithPosts = await qb
    .select(["id", "name", "email"])
    .from("users")
    .join("INNER", "posts", "users.id", "posts.user_id")
    .select(["id", "title", "content"])
    .where("users.status", "=", "active")
    .orderBy("posts.created_at", "DESC")
    .execute();

  console.log("Users with posts:", usersWithPosts);
}

// Example 8: LEFT JOIN - All users and their posts (if any)
async function example8() {
  const qb = new QueryBuilder();
  const data = await qb
    .multiSelect([
      { table: "users", columns: ["id", "name", "email"] },
      { table: "posts", columns: ["id", "title"] },
    ])
    .join("LEFT", "posts", "users.id", "posts.user_id")
    .where("users.status", "=", "active")
    .execute();

  console.log("All users and their posts:", data);
}

// Example 9: Multiple JOINs - Users with posts and comments
async function example9() {
  const qb = new QueryBuilder();
  const data = await qb
    .multiSelect([
      { table: "users", columns: ["id", "name", "email"] },
      { table: "posts", columns: ["id", "title", "content"] },
      { table: "comments", columns: ["id", "text", "created_at"] },
    ])
    .join("INNER", "posts", "users.id", "posts.user_id")
    .join("LEFT", "comments", "posts.id", "comments.post_id")
    .where("users.id", "=", 1)
    .orderBy("posts.created_at", "DESC")
    .execute();

  console.log("User with posts and comments:", data);
}

// Example 10: Complex multi-table query with filters
async function example10() {
  const qb = new QueryBuilder();
  const data = await qb
    .multiSelect([
      { table: "users", columns: ["id", "name"] },
      { table: "posts", columns: ["id", "title", "status"] },
      { table: "comments", columns: ["id", "text"] },
    ])
    .join("INNER", "posts", "users.id", "posts.user_id")
    .join("LEFT", "comments", "posts.id", "comments.post_id")
    .where("posts.status", "=", "published")
    .where("users.status", "=", "active")
    .orderBy("posts.created_at", "DESC")
    .limit(20)
    .offset(0)
    .execute();

  console.log("Published posts with comments:", data);
}

// Example 11: MultiSelect with WHERE IN
async function example11() {
  const qb = new QueryBuilder();
  const data = await qb
    .multiSelect([
      { table: "users", columns: ["id", "name"] },
      { table: "orders", columns: ["id", "total", "status"] },
    ])
    .join("INNER", "orders", "users.id", "orders.user_id")
    .whereIn("orders.status", ["completed", "pending"])
    .orderBy("orders.created_at", "DESC")
    .execute();

  console.log("Users with orders:", data);
}

module.exports = QueryBuilder;
