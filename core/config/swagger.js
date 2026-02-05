const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const path = require("path");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "MySql ORM API",
      version: "1.0.0",
      description:
        "MySQL ORM is a custom-built Node.js backend framework designed to simplify database interactions with MySQL.",
    },
    servers: [{ url: "http://localhost:3000" }], // Your API base URL
  },
  // Use absolute paths so swagger-jsdoc reliably finds files regardless of cwd
  apis: [
    path.resolve(__dirname, "../../route/*.js"),
    path.resolve(__dirname, "../../index.js"),
  ],
};

const specs = swaggerJsdoc(options);

// // DEBUG: print which files were requested and which paths were generated
// console.log("Swagger config apis:", options.apis);
// console.log("Swagger spec paths:", Object.keys(specs.paths || {}));

module.exports = specs;
