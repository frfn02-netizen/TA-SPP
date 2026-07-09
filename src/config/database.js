const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "sppuser",
  password: "SppQris@2026!",
  database: "spp_qris",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
