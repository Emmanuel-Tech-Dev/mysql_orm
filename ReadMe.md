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
- [File Upload & Storage](#file-upload--storage)
- [OTP & Security](#otp--security)
- [Caching](#caching)
- [Utilities & Helpers](#utilities--helpers)
- [Technologies Used](#technologies-used)
- [Testing](#testing)
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
- ✅ **Complex JOIN Support** - INNER, LEFT, RIGHT, FULL, CROSS JOINs with multi-select queries
- ✅ **Bulk Operations** - Bulk insert and update operations for efficient batch processing
- ✅ **Table Validation Middleware** - Automatic validation of requested resources
- ✅ **Comprehensive Logging** - Winston-based logging with daily log rotation and multiple log types
- ✅ **Error Handling** - Centralized error management with predefined error codes
- ✅ **Caching Layer** - LRU Cache with TTL, access tracking, and dormancy cleanup
- ✅ **File Upload Service** - Cloudinary integration for image/video uploads with metadata
- ✅ **OTP Service** - Two-factor authentication with TOTP and QR code generation
- ✅ **Utility Functions** - Helper functions for data transformation and password removal
- ✅ **Rate Limiting** - Built-in request rate limiting with configurable windows
- ✅ **Security** - CORS, Helmet, CSRF protection, password removal utilities
- ✅ **Email Support** - Nodemailer integration for sending emails
- ✅ **Payment Integration** - Paystack payment gateway support
- ✅ **Database Connection Pooling** - Efficient MySQL2 connection management

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
├── Api_Testing/                    # API testing collections
│   ├── BaseRoute/                  # Postman/API test files for base routes
│   ├── MySQL_ORM/                  # Specific ORM test files
│   └── file Upload/                # File upload test configurations
├── core/
│   ├── config/
│   │   ├── conn.js                 # MySQL connection pool setup
│   │   ├── cloudinary.js           # Cloudinary image/video service config
│   │   └── multer.js               # File upload middleware configuration
│   ├── lib/
│   │   ├── queryBuilder.js         # Fluent query builder class
│   │   ├── baseService.js          # Base service (business logic)
│   │   └── uploadServices.js       # Cloudinary upload service
│   ├── middleware/
│   │   └── validateTable.js        # Table validation middleware
│   └── model/
│       └── model.js                # Model class (extends QueryBuilder)
├── route/
│   └── baseRoute.js                # Base route handler (instantiates BaseService)
├── resources/
│   └── logs/                       # Application logs directory
├── shared/
│   ├── helpers/
│   │   ├── logger.js               # Winston logger service with daily rotation
│   │   ├── AppError.js             # Centralized error class with error codes
│   │   ├── cacheManager.js         # LRU cache with TTL and cleanup
│   │   ├── otpService.js           # OTP generation and verification service
│   │   ├── tokenBlacklist.js       # JWT token blacklist management
│   │   └── erroCodes.js            # Error code definitions
│   └── utils/
│       └── functions.js            # Utility helper functions
├── index.js                        # Express app entry point
├── locustfile.py                   # Load testing configuration
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
GET    /api/:resources              # Get all records with optional filters
GET    /api/:resources/:id          # Get a single record
POST   /api/:resources              # Create a new record
POST   /api/:resources/query        # Advanced query with filters and pagination
PUT    /api/:resources/:id          # Update a record
DELETE /api/:resources/:id          # Delete a record
```

### Example Requests

#### Get All Users with Filters

```bash
# Basic fetch
curl http://localhost:3000/api/users

# With search
curl "http://localhost:3000/api/users?search=john"

# With filtering
curl "http://localhost:3000/api/users?status=active&role=admin"

# With range filters
curl "http://localhost:3000/api/users?age_min=18&age_max=65"

# With IN operator
curl "http://localhost:3000/api/users?status_in=active,pending,approved"

# With pagination
curl "http://localhost:3000/api/users?page=1&limit=10"

# With sorting
curl "http://localhost:3000/api/users?sort=created_at&direction=DESC"
```

#### Advanced Query with POST (Query Endpoint)

```bash
curl -X POST http://localhost:3000/api/users/query \
  -H "Content-Type: application/json" \
  -d '{
    "search": "john",
    "filterable": ["status", "role"],
    "searchable": ["name", "email"],
    "sortable": ["created_at"],
    "paginate": {
      "page": 1,
      "limit": 20
    }
  }'
```

#### Create a User

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "status": "active"
  }'
```

#### Create Multiple Users (Bulk Insert)

```bash
curl -X POST http://localhost:3000/api/users/bulk \
  -H "Content-Type: application/json" \
  -d '[
    { "username": "user1", "email": "user1@example.com" },
    { "username": "user2", "email": "user2@example.com" }
  ]'
```

#### Update a User

```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "inactive",
    "updated_at": "2024-12-06"
  }'
```

#### Delete a User

```bash
curl -X DELETE http://localhost:3000/api/users/1
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

### GROUP BY

```javascript
// Group by single column
new Model().select("*", "users").groupBy("status").execute();

// Group by multiple columns
new Model().select("*", "users").groupBy(["status", "role"]).execute();
```

### JOINS - Single and Multiple

```javascript
// INNER JOIN
new Model()
  .select("*", "users")
  .join("INNER", "posts", "users.id", "posts.user_id")
  .execute();

// LEFT JOIN
new Model()
  .select("*", "users")
  .join("LEFT", "profiles", "users.id", "profiles.user_id")
  .execute();

// Multiple JOINs
new Model()
  .select("*", "users")
  .join("INNER", "posts", "users.id", "posts.user_id")
  .join("LEFT", "comments", "posts.id", "comments.post_id")
  .execute();

// With explicit operator
new Model()
  .select("*", "users")
  .join("INNER", "posts", "users.id", "=", "posts.user_id")
  .execute();
```

### Multi-Select with JOINs

```javascript
// Select specific columns from multiple tables
new Model()
  .multiSelect([
    { table: "users", columns: ["id", "name", "email"] },
    { table: "posts", columns: ["id", "title", "content"] },
    { table: "comments", columns: ["id", "text"] },
  ])
  .join("INNER", "posts", "users.id", "posts.user_id")
  .join("LEFT", "comments", "posts.id", "comments.post_id")
  .execute();
```

### LIMIT & Pagination

```javascript
// Limit results
new Model().select("*", "users").limit(10).execute();

// Offset
new Model().select("*", "users").limit(20).offset(10).execute();

// Pagination helper
new Model()
  .select("*", "users")
  .paginate((page = 1), (limit = 20))
  .execute();
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

## 🔁 Routing & BaseService

This project uses a routing helper class `BaseRoute` (in `route/baseRoute.js`) that wires HTTP routes to a per-request `BaseService` instance. `BaseService` lives in `core/lib/baseService.js` and is constructed with the current `req` and `res` objects: `new BaseService(req, res)`.

### Key Architecture Points:

- `BaseRoute` registers route handlers and (for each request) creates `new BaseService(req, res)` before calling service methods.
- `BaseService` focuses on business logic/DB calls and typically lets errors bubble up (do not swallow errors inside the service).
- The route handler (or controller) should catch errors and use the logger to record details, then send an HTTP response.
- Built-in password removal utility ensures sensitive data never leaks in API responses.

### BaseService Methods:

```javascript
const service = new BaseService(req, res);

// Fetch all records with default pagination
await service.findAll();

// Fetch with advanced parameters and pagination
await service.findAllWithParams(options);

// Fetch single record by ID
await service.findOne(payload);

// Create new record
await service.create(payload);

// Bulk create multiple records
await service.bulkCreate(payload);

// Update record by ID
await service.updateRecord(payload);

// Delete record by ID
await service.deleteRecord(payload);
```

### Example Pattern (from `route/baseRoute.js`):

```javascript
app.get("/api/:resources", validateTable, async (req, res) => {
  try {
    const service = new BaseService(req, res);
    const data = await service.findAll();
    return res.status(200).json({ success: true, data });
  } catch (err) {
    logger.error("ERROR_FINDING_ALL", {
      error: err.message,
      route: req.originalUrl,
    });
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong." });
  }
});
```

This approach keeps `BaseService` testable and reusable while centralizing HTTP error handling in the route layer.

---

## � File Upload & Storage

### Cloudinary Integration

**File:** `core/lib/uploadServices.js` and `core/config/cloudinary.js`

The framework integrates with Cloudinary for secure, scalable image and video storage:

```javascript
const { UploadService } = require("./core/lib/uploadServices");
const { uploadSingle } = require("./core/config/multer");

// Single file upload
const uploadService = new UploadService();
const result = await uploadService.uploadSingleFile(file, "folder/path");

// Result includes:
// {
//   url: "secure_url",
//   public_id: "id",
//   resource_type: "image|video",
//   format: "jpg|mp4",
//   size: bytes,
//   version: "v123"
// }
```

### Multer Configuration

**File:** `core/config/multer.js`

Pre-configured for memory or disk storage:

```javascript
const { uploadSingle } = require("./core/config/multer");

// Use in routes
app.post("/api/upload", uploadSingle, async (req, res) => {
  // file is in req.file
  const result = await uploadService.uploadSingleFile(req.file);
  res.json(result);
});
```

### Environment Variables Required

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 🔐 OTP & Security

### OTP Service

**File:** `shared/helpers/otpService.js`

Two-factor authentication with TOTP (Time-based One-Time Password):

```javascript
const OTPService = require("./shared/helpers/otpService");
const otpService = new OTPService();

// Generate OTP secret for user
const secret = otpService.generateOtpSecret();

// Generate current OTP code
const code = otpService.generateOtpCode(secret);

// Verify OTP code with rate limiting
const result = otpService.verifyOtp(inputCode, secret, userId);
// Returns: { isValid: boolean, error?: string, remainingTime?: number }

// Generate QR code for authenticator apps
const qrCode = await otpService.generateQrCode(secret, "app_name");
```

### Features:

- TOTP (Time-based One-Time Password) generation
- QR code generation for authenticator app enrollment
- Built-in rate limiting (5 attempts, 15-minute lockout)
- User-based attempt tracking
- Parameter validation

### AppError Class

**File:** `shared/helpers/AppError.js`

Centralized error handling with predefined error codes:

```javascript
const AppError = require("./shared/helpers/AppError");

// Throw custom error
throw new AppError("ERR_USER_NOT_FOUND", {
  userId: 123,
  timestamp: new Date(),
});

// Available error codes:
// ERR_BAD_REQUEST, ERR_UNAUTHORIZED, ERR_FORBIDDEN, ERR_NOT_FOUND
// ERR_DUPLICATE_ENTRY, ERR_RATE_LIMIT_EXCEEDED, etc.
```

### Token Blacklist

**File:** `shared/helpers/tokenBlacklist.js`

Manage JWT token blacklisting for logout functionality:

```javascript
const tokenBlacklist = require("./shared/helpers/tokenBlacklist");

// Add token to blacklist
tokenBlacklist.add(token);

// Check if token is blacklisted
if (tokenBlacklist.isBlacklisted(token)) {
  // Token is invalid
}

// Clear expired tokens
tokenBlacklist.clearExpired();
```

---

## 💾 Caching

### Cache Manager

**File:** `shared/helpers/cacheManager.js`

LRU (Least Recently Used) cache with TTL and automatic cleanup:

```javascript
const CacheManager = require("./shared/helpers/cacheManager");

const cache = new CacheManager({
  maxItems: 1000,
  ttl: 1000 * 60 * 15, // 15 minutes
  dormancyThreshold: 1000 * 60 * 60, // 1 hour
  cleanupInterval: 1000 * 60 * 10, // 10 minutes
});

// Set value with optional custom TTL
cache.set("user:1", userData, 1000 * 60 * 5);

// Get value
const data = cache.get("user:1");

// Check if key exists
if (cache.has("user:1")) {
  // ...
}

// Clear key
cache.delete("user:1");

// Get all keys
const keys = cache.keys();

// Get cache statistics
const stats = cache.getStats();
```

### Features:

- Automatic TTL expiration
- LRU eviction when max items reached
- Access tracking and dormancy cleanup
- Memory-efficient operation
- Statistics tracking

---

### Logger Service

**File:** `shared/helpers/logger.js`

Winston-based logging with daily log rotation and multiple log categories:

```javascript
const logger = require("./shared/helpers/logger");

// Initialize logger (if needed)
await logger.initialize();

// Log different levels and categories
logger.info("Application started");
logger.error("An error occurred", { error: errorObject });
logger.warn("Warning message");
logger.debug("Debug information");

// Log by category
logger.access("GET /users - 200 OK"); // HTTP access logs
logger.query("SELECT * FROM users"); // Database queries
logger.security("Failed login attempt"); // Security events
logger.performance("Query took 45ms"); // Performance metrics
```

### Log Files

Stored in `resources/logs/` with daily rotation:

- `access-%DATE%.log` - HTTP request/response logs
- `error-%DATE%.log` - Application errors
- `query-%DATE%.log` - Database query logs
- `security-%DATE%.log` - Security-related events (failed logins, suspicious activity)
- `performance-%DATE%.log` - Performance metrics and timings
- `app-%DATE%.log` - General application logs

### Configuration

```env
LOG_LEVEL=debug              # trace, debug, verbose, http, info, warn, error
LOG_PATH=./resources/logs    # Directory for log files
NODE_ENV=development         # Affects log level default
```

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

#### Remove Password from Object (updated)

The utility `removePasswordFromObject` has been updated to handle:

- Direct arrays (pass an array of objects)
- Objects with nested arrays under keys like `results`, `items`, or `data`
- Deeply nested objects — removal is recursive

```javascript
// Direct array input
const users = [
  { id: 1, username: "john", password: "secret" },
  { id: 2, username: "jane", password: "secret" },
];
const safeUsers = utils.removePasswordFromObject(users);

// Object with data/results arrays
const response = {
  data: [
    { id: 1, username: "john", password: "secret" },
    { id: 2, username: "jane", password: "secret" },
  ],
};
const safe = utils.removePasswordFromObject(response);

// Deeply nested example
const nested = {
  meta: { total: 2 },
  items: [{ user: { id: 1, password: "x" }, profile: { password: "y" } }],
};
const cleaned = utils.removePasswordFromObject(nested);
// All `password` fields removed from arrays and nested objects
```

---

## 🛠️ Technologies Used

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MySQL2** - MySQL database driver with connection pooling
- **Winston** - Logging library with daily rotation
- **Helmet** - Security headers middleware
- **CORS** - Cross-Origin Resource Sharing middleware
- **express-validator** - Request validation
- **express-rate-limit** - Rate limiting middleware
- **bcrypt** - Password hashing
- **jsonwebtoken** - JWT authentication
- **dotenv** - Environment variable management
- **morgan** - HTTP request logger
- **multer** - File upload handling
- **axios** - HTTP client
- **cloudinary** - Image/video storage service
- **nodemailer** - Email sending service
- **otp** - One-Time Password generation
- **qrcode** - QR code generation
- **lru-cache** - Caching library
- **node-cache** - In-memory caching
- **moment** - Date/time library
- **lodash** - Utility library
- **paystack** - Payment gateway integration
- **csv-parser** - CSV file parsing
- **uuid** - UUID generation
- **csurf** - CSRF protection
- **request-ip** - IP address retrieval
- **response-time** - Response timing middleware
- **useragent** - User agent parsing
- **flatted** - Circular reference handling

---

## 🧪 Testing

### Load Testing with Locust

**File:** `locustfile.py`

Included Python script for load testing your API:

```bash
# Install Locust
pip install locust

# Run load tests
locust -f locustfile.py --host=http://localhost:3000
```

### API Testing with Postman/Requestly

Pre-configured test collections are available in `Api_Testing/`:

- **BaseRoute Tests** - CRUD operation tests
- **MySQL_ORM Tests** - ORM-specific tests
- **File Upload Tests** - File upload scenario tests

Import these collections into Postman or use with Requestly for API validation.

---

## 🚀 Quick Start Example

Create a complete API endpoint with MySQL ORM:

```javascript
// Example: Get all users with advanced filtering
const Model = require("./core/model/model");
const BaseService = require("./core/lib/baseService");

app.post("/api/users/query", async (req, res) => {
  try {
    const service = new BaseService(req, res);

    const users = await new Model()
      .select("*", "users")
      .applyQueryParams(req.query, {
        searchable: ["name", "email"],
        filterable: ["status", "role", "department"],
        sortable: ["created_at", "updated_at", "name"],
        maxLimit: 100,
        defaultLimit: 20,
      })
      .execute();

    res.json({
      success: true,
      data: users,
      count: users.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Example: Create user with file upload
app.post("/api/users/create", uploadSingle, async (req, res) => {
  try {
    const { username, email } = req.body;

    // Upload profile picture if provided
    let profilePicUrl = null;
    if (req.file) {
      const uploadService = new UploadService();
      const uploadResult = await uploadService.uploadSingleFile(
        req.file,
        "users/profiles"
      );
      profilePicUrl = uploadResult.url;
    }

    // Create user
    const result = await new Model()
      .insert("users", {
        username,
        email,
        profile_picture: profilePicUrl,
        created_at: new Date(),
      })
      .execute();

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: result,
    });
  } catch (error) {
    logger.error("USER_CREATION_FAILED", { error: error.message });
    res.status(500).json({
      success: false,
      error: "Failed to create user",
    });
  }
});

// Example: JOINs for related data
app.get("/api/posts/with-comments", async (req, res) => {
  try {
    const posts = await new Model()
      .multiSelect([
        { table: "posts", columns: ["id", "title", "content", "user_id"] },
        { table: "comments", columns: ["id", "text", "post_id"] },
        { table: "users", columns: ["id", "name", "email"] },
      ])
      .join("INNER", "comments", "posts.id", "comments.post_id")
      .join("INNER", "users", "posts.user_id", "users.id")
      .orderBy("posts.created_at", "DESC")
      .execute();

    res.json({
      success: true,
      data: posts,
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
