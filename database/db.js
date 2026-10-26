require("dotenv").config();

const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    // Return DATE columns as plain YYYY-MM-DD strings so they don't shift with the server's timezone/DST.
    dateStrings: ['DATE']
});

module.exports = pool;