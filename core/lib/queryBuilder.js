const conn = require("../config/conn"); // Your connection pool

class QueryBuilder {
  constructor() {
    this.query = "";
    this.params = [];
    this.type = "";
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
    this.sql = sql;
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
    if (dataArray.length === 0) {
      throw new Error("Data array for bulk insert cannot be empty");
    }

    const columns = Object.keys(dataArray[0]);
    const valuesPlaceholders = dataArray
      .map(() => `(${columns.map(() => "?").join(", ")})`)
      .join(", ");

    this.query = `INSERT INTO ${table} (${columns.join(
      ", "
    )}) VALUES ${valuesPlaceholders}`;

    this.params = dataArray.reduce((acc, data) => {
      return acc.concat(Object.values(data));
    }, []);
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

  // Execute the query
  async execute() {
    try {
      const [rows] = await conn.query(this.query, this.params);
      return rows;
    } catch (error) {
      throw new Error(`Query execution failed: ${error.message}`);
    }
  }

  // Get the raw query (for debugging)
  getSQL() {
    return { query: this.query, params: this.params };
  }

  // Reset the query builder
  reset() {
    this.query = "";
    this.params = [];
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

  const { query, params } = qb.toSQL();
  console.log("Query:", query);
  console.log("Params:", params);
  // Output:
  // Query: SELECT id, name FROM products WHERE price < ? AND in_stock = ?
  // Params: [100, true]
}

// ============================================
// EXPRESS ROUTE EXAMPLES
// ============================================

// In your Express app:
// const express = require("express");
// const app = express();

// // Get all users
// app.get("/users", async (req, res) => {
//   try {
//     const qb = new QueryBuilder();
//     const users = await qb.select().from("users").execute();

//     res.json({ success: true, data: users });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // Get user by ID
// app.get("/users/:id", async (req, res) => {
//   try {
//     const qb = new QueryBuilder();
//     const user = await qb
//       .select()
//       .from("users")
//       .where("id", "=", req.params.id)
//       .execute();

//     if (user.length === 0) {
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found" });
//     }

//     res.json({ success: true, data: user[0] });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // Search users with filters
// app.get("/users/search", async (req, res) => {
//   try {
//     const { status, minAge, limit = 20, offset = 0 } = req.query;

//     const qb = new QueryBuilder();
//     qb.select(["id", "name", "email", "age", "status"]).from("users");

//     if (status) {
//       qb.where("status", "=", status);
//     }

//     if (minAge) {
//       qb.where("age", ">=", minAge);
//     }

//     const users = await qb
//       .orderBy("created_at", "DESC")
//       .limit(parseInt(limit))
//       .offset(parseInt(offset))
//       .execute();

//     res.json({ success: true, data: users, count: users.length });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

module.exports = QueryBuilder;
