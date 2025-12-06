# 📘 MySQL ORM - Node.js Backend Framework

_A powerful and scalable Node.js backend framework that eliminates manual SQL queries. Build RESTful APIs with a custom ORM that handles complex database operations effortlessly. Simply configure your database connection in the `.env` file and start building!_

---

## 🧭 Table of Contents

- [About](#about)
- [Features](#features)
- [Installation](#installation)
- [Configuration](#configuration)
- [Folder Structure](#folder-structure)
- [Core Concepts](#core-concepts)
- [Usage Guide](#usage-guide)
- [API Reference](#api-reference)
- [Query Builder Methods](#query-builder-methods)
- [Models & Database](#models--database)
- [Middleware](#middleware)
- [Utilities & Helpers](#utilities--helpers)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## 📝 About

MySQL ORM is a custom-built Node.js backend framework designed to simplify database interactions with MySQL. It provides a fluent query builder, automatic table validation, comprehensive logging, and RESTful API scaffolding. Built on Express.js, it handles all CRUD operations through an intuitive ORM interface without writing raw SQL.

---

## ✨ Features

- ✅ **Fluent Query Builder** - Chainable methods for SELECT, WHERE, JOIN, ORDER BY, LIMIT, etc.
- ✅ **Dynamic Model Class** - Extends QueryBuilder with connection pooling and automatic execution
- ✅ **Advanced Filtering** - Support for search, filters, ranges, IN/NOT IN queries, pagination
- ✅ **Table Validation Middleware** - Automatic validation of requested resources
- ✅ **Comprehensive Logging** - Winston-based logging with daily log rotation
- ✅ **Error Handling** - Centralized error management
- ✅ **Utility Functions** - Helper functions for data transformation
- ✅ **Rate Limiting** - Built-in request rate limiting
- ✅ **Security** - CORS, Helmet, CSRF protection, password removal utilities

---

## ⚙️ Installation

### Prerequisites

- Node.js (v18+)
- npm or yarn
- MySQL 5.7+ (or compatible database)

### Steps

```bash
# Clone the repository
git clone https://github.com/Emmanuel-Tech-Dev/mysql_orm.git

# Navigate to the project directory
cd mysql_orm

# Install dependencies
npm install

# Create a .env file with your database configuration
cp .env.example .env

# Start development server
npm run dev

# Or for production
npm start
```

---

## ⚙️ Configuration

Create a `.env` file in the project root with the following variables:

```env
# Database Configuration
DATABASE_HOST=localhost
DATABASE_USER=root
DATABASE_PASSWORD=your_password
DATABASE_NAME=your_database

# Server Configuration
PORT=3000
NODE_ENV=development

# Logging
LOG_LEVEL=debug
LOG_PATH=./resources/logs

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=500

# CORS
ALLOWED_ORIGINS=http://localhost:3001,http://localhost:3000

# JWT (if using authentication)
JWT_SECRET=your_jwt_secret_key
```

---

## 📁 Folder Structure

```
mysql_orm/
├── core/
│   ├── config/
│   │   └── conn.js                 # MySQL connection pool setup
│   ├── lib/
│   │   ├── queryBuilder.js         # Fluent query builder class
│   │   └── baseRoute.js            # Base route configuration
│   ├── middleware/
│   │   └── validateTable.js        # Table validation middleware
│   └── model/
│       └── model.js                # Model class (extends QueryBuilder)
├── route/
│   └── genericRoute.js             # Generic route handler
├── resources/
│   └── logs/                       # Application logs directory
├── shared/
│   ├── helpers/
│   │   └── logger.js               # Winston logger service
│   └── utils/
│       └── functions.js            # Utility helper functions
├── index.js                        # Express app entry point
├── package.json
├── .env                            # Environment variables
├── .env.example                    # Example environment file
├── .gitignore
└── README.md
```

---

## 🏗️ Core Concepts

### Connection Pool

The framework uses MySQL2 connection pooling for optimal performance:

**File:** `core/config/conn.js`

```javascript
const mysql = require("mysql2");
const pool = mysql.createPool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool.promise(); // Promise-based pool
```

### Model Architecture

The `Model` class extends `QueryBuilder` and provides database execution capabilities:

**File:** `core/model/model.js`

```javascript
class Model extends QueryBuilder {
  constructor() {
    super();
    this.pool = conn;
    this._paginate = {};
  }

  async execute() {
    // Executes the built query and returns results
  }

  applyQueryParams(queryParams, options = {}) {
    // Applies search, filter, sort, and pagination parameters
  }
}
```

---

## 🚀 Usage Guide

### Basic CRUD Operations

#### 1. **SELECT - Fetch Records**

```javascript
const Model = require("./core/model/model");

async function getUsers() {
  const users = await new Model().select("*", "users").execute();

  return users;
}
```

#### 2. **SELECT with WHERE Clause**

```javascript
async function getUserById(id) {
  const user = await new Model()
    .select("*", "users")
    .where("id", "=", id)
    .execute();

  return user;
}
```

#### 3. **INSERT - Create a Record**

```javascript
async function createUser(userData) {
  const result = await new Model().insert("users", userData).execute();

  return result;
}
```

#### 4. **UPDATE - Modify Records**

```javascript
async function updateUser(id, updatedData) {
  const result = await new Model()
    .update("users", updatedData)
    .where("id", "=", id)
    .execute();

  return result;
}
```

#### 5. **DELETE - Remove Records**

```javascript
async function deleteUser(id) {
  const result = await new Model()
    .delete("users")
    .where("id", "=", id)
    .execute();

  return result;
}
```

---

## 📡 API Reference

### Generic Resource Endpoints

The framework provides automatic CRUD endpoints for any table:

```
GET    /api/v1/:resources          # Get all records with optional filters
GET    /api/v1/:resources/:id      # Get a single record
POST   /api/v1/:resources          # Create a new record
PUT    /api/v1/:resources/:id      # Update a record
DELETE /api/v1/:resources/:id      # Delete a record
```

### Example Requests

#### Get All Users with Filters

```bash
# Basic fetch
curl http://localhost:3000/api/v1/users

# With search
curl "http://localhost:3000/api/v1/users?search=john"

# With filtering
curl "http://localhost:3000/api/v1/users?status=active&role=admin"

# With range filters
curl "http://localhost:3000/api/v1/users?age_min=18&age_max=65"

# With IN operator
curl "http://localhost:3000/api/v1/users?status_in=active,pending,approved"

# With pagination
curl "http://localhost:3000/api/v1/users?page=1&limit=10"

# With sorting
curl "http://localhost:3000/api/v1/users?sort=created_at&direction=DESC"
```

#### Create a User

```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "status": "active"
  }'
```

#### Update a User

```bash
curl -X PUT http://localhost:3000/api/v1/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "inactive",
    "updated_at": "2024-12-06"
  }'
```

#### Delete a User

```bash
curl -X DELETE http://localhost:3000/api/v1/users/1
```

---

## 🔨 Query Builder Methods

The QueryBuilder class provides a fluent interface for constructing SQL queries:

### SELECT Operations

```javascript
// Select specific columns
new Model().select(["id", "name", "email"], "users").execute();

// Select all columns
new Model().select("*", "users").execute();
```

### WHERE Clauses

```javascript
// Single condition
new Model().select("*", "users").where("status", "=", "active").execute();

// Multiple conditions (AND logic)
new Model()
  .select("*", "users")
  .where([
    { column: "status", operator: "=", value: "active" },
    { column: "role", operator: "=", value: "admin" },
  ])
  .execute();

// OR conditions
new Model()
  .select("*", "users")
  .orWhere([
    { column: "status", operator: "=", value: "active" },
    { column: "status", operator: "=", value: "pending" },
  ])
  .execute();
```

### WHERE IN / NOT IN

```javascript
// IN operator
new Model()
  .select("*", "users")
  .whereIn("status", ["active", "pending", "approved"])
  .execute();

// NOT IN operator
new Model()
  .select("*", "users")
  .whereNotIn("role", ["banned", "suspended"])
  .execute();
```

### WHERE BETWEEN

```javascript
// Between range
new Model().select("*", "users").whereBetween("age", 18, 65).execute();
```

### WHERE LIKE

```javascript
// Pattern matching
new Model().select("*", "users").whereLike("email", "%@gmail.com").execute();
```

### WHERE NULL / NOT NULL

```javascript
// IS NULL
new Model().select("*", "users").whereNull("deleted_at").execute();

// IS NOT NULL
new Model().select("*", "users").whereNotNull("verified_at").execute();
```

### ORDER BY

```javascript
// Ascending order
new Model().select("*", "users").orderBy("created_at", "ASC").execute();

// Descending order
new Model().select("*", "users").orderBy("created_at", "DESC").execute();
```

### LIMIT & PAGINATION

```javascript
// Limit results
new Model().select("*", "users").limit(10).execute();

// Pagination
new Model().select("*", "users").limit(20).orderBy("id", "ASC").execute();
```

### Apply Query Parameters

The `applyQueryParams` method provides advanced filtering from URL query strings:

```javascript
const queryParams = req.query;
const options = {
  searchable: ["name", "email"],
  filterable: ["status", "role", "age"],
  sortable: ["created_at", "updated_at"],
  maxLimit: 100,
  defaultLimit: 20,
};

const results = await new Model()
  .select("*", "users")
  .applyQueryParams(queryParams, options)
  .execute();
```

**Query String Features:**

- `?search=text` - Search across searchable fields
- `?column=value` - Filter by exact value
- `?column_min=value&column_max=value` - Range filtering
- `?column_in=val1,val2` - IN clause
- `?column_not_in=val1,val2` - NOT IN clause
- `?column_like=pattern` - LIKE clause
- `?page=1&limit=20` - Pagination

---

## 🗄️ Models & Database

### Creating a Model Instance

```javascript
const Model = require("./core/model/model");

const model = new Model();
```

### Executing Queries

All queries execute through the `execute()` method, which uses the connection pool:

```javascript
async function fetchData() {
  try {
    const results = await model
      .select("*", "products")
      .where("category", "=", "electronics")
      .orderBy("price", "DESC")
      .limit(10)
      .execute();

    return results;
  } catch (error) {
    console.error("Query failed:", error.message);
  }
}
```

### Query Validation

The `tableExists()` method checks if a table is available:

```javascript
const tableExists = await new Model().tableExists("users");
if (tableExists) {
  // Proceed with query
}
```

---

## 🛡️ Middleware

### Table Validation Middleware

**File:** `core/middleware/validateTable.js`

Validates that the requested resource (table) exists before allowing the request:

```javascript
const validateTable = require("./core/middleware/validateTable");

// Apply middleware to routes
app.use("/api/v1/:resources", validateTable);
```

**Usage:**

```javascript
// This will validate if the "users" table exists
GET / api / v1 / users;
```

**Example Middleware Code:**

```javascript
async function validateTable(req, res, next) {
  try {
    const tableName = req.params.resources;
    const exists = await new Model().tableExists(tableName);

    if (!exists) {
      return res.status(404).json({
        success: false,
        message: "Resource not available",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
}
```

---

## 🔧 Utilities & Helpers

### Logger Service

**File:** `shared/helpers/logger.js`

Winston-based logging with daily log rotation:

```javascript
const logger = require("./shared/helpers/logger");

// Log different levels
logger.info("Application started");
logger.error("An error occurred", { error: errorObject });
logger.warn("Warning message");
logger.debug("Debug information");

// Log by category
logger.access("GET /users - 200 OK");
logger.query("SELECT * FROM users");
logger.security("Failed login attempt");
logger.performance("Query took 45ms");
```

**Log Files:** Stored in `resources/logs/` with daily rotation

- `access-%DATE%.log` - HTTP access logs
- `error-%DATE%.log` - Error logs
- `query-%DATE%.log` - Database query logs
- `security-%DATE%.log` - Security-related logs
- `performance-%DATE%.log` - Performance metrics
- `app-%DATE%.log` - General application logs

### Utility Functions

**File:** `shared/utils/functions.js`

#### Convert Array to Object

```javascript
const utils = require("./shared/utils/functions");

// Converts array wrapper to single object
const result = utils.convertArrayToObject(arrayData);

// Example:
const data = {
  record: { id: 1, name: "John" },
};
const converted = utils.convertArrayToObject(data);
// Result: { record: { id: 1, name: "John" }, ... }
```

#### Remove Password from Object

```javascript
// Removes password fields from objects (for API responses)
const safeUser = utils.removePasswordFromObject(userData);

// Also removes passwords from arrays
const safeUsers = utils.removePasswordFromObject({
  results: [userObj1, userObj2],
});

// Also works with 'items' and 'data' keys
const response = {
  data: [
    { id: 1, username: "john", password: "secret" },
    { id: 2, username: "jane", password: "secret" },
  ],
};
const safe = utils.removePasswordFromObject(response);
// Passwords are removed from all items in the data array
```

---

## 🛠️ Technologies Used

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MySQL2** - MySQL database driver with connection pooling
- **Winston** - Logging library with daily rotation
- **Helmet** - Security headers middleware
- **CORS** - Cross-Origin Resource Sharing
- **express-validator** - Request validation
- **bcrypt** - Password hashing
- **jsonwebtoken** - JWT authentication
- **dotenv** - Environment variable management
- **morgan** - HTTP request logger
- **express-rate-limit** - Rate limiting middleware
- **multer** - File upload handling
- **axios** - HTTP client
- **cloudinary** - Image storage service
- **nodemailer** - Email sending

---

## 🚀 Quick Start Example

Create a simple API endpoint with MySQL ORM:

```javascript
// Example: Get all users from database
const Model = require("./core/model/model");

app.get("/api/v1/users", async (req, res) => {
  try {
    const users = await new Model()
      .select("*", "users")
      .applyQueryParams(req.query, {
        searchable: ["name", "email"],
        filterable: ["status", "role"],
        maxLimit: 100,
      })
      .execute();

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the project
2. Create your feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a pull request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 📬 Contact

**Emmanuel Tech Dev**  
📧 [eks607067@gmail.com](mailto:eks607067@gmail.com)  
🔗 [github.com/Emmanuel-Tech-Dev](https://github.com/Emmanuel-Tech-Dev)
