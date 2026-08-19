const mysql = require("mysql2/promise");

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "YOUR_MYSQL_PASSWORD",
  database: process.env.DB_NAME || "fithub",
  waitForConnections: true,
  connectionLimit: 10,
  decimalNumbers: true
};

const pool = mysql.createPool(dbConfig);

pool.getConnection()
  .then((connection) => {
    console.log("Connected to MySQL database");
    connection.release();
  })
  .catch((error) => {
    console.error("Database connection failed:", error.message);
  });

module.exports = { pool };
