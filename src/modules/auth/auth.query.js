const db = require("../../config/database");

const findByUsername = async (username) => {
  const [rows] = await db.execute("SELECT * FROM users WHERE username = ? LIMIT 1", [username]);
  return rows[0];
};

const createUser = async (conn, { username, password, role }) => {
  const [result] = await conn.execute(
    "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
    [username, password, role],
  );
  return result.insertId;
};

const updateLastLogin = (id) => db.execute("UPDATE users SET last_login = NOW() WHERE id = ?", [id]);

module.exports = { findByUsername, createUser, updateLastLogin };
