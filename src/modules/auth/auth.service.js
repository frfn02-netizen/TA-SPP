const db = require("../../config/database");
const authQuery = require("./auth.query");
const { hashPassword, comparePassword } = require("../../utils/hash");
const { generateToken } = require("../../utils/jwt");
const AppError = require("../../utils/app-error");

const register = async ({ username, password }) => {
  const role = "SISWA";
  if (await authQuery.findByUsername(username)) throw new AppError("Username sudah digunakan", 409);
  const conn = await db.getConnection();
  try {
    const id = await authQuery.createUser(conn, { username, password: await hashPassword(password), role });
    return { id, username, role };
  } finally {
    conn.release();
  }
};

const login = async ({ username, password }) => {
  const user = await authQuery.findByUsername(username);
  if (!user || !(await comparePassword(password, user.password))) throw new AppError("Username atau kata sandi salah", 401);
  if (!user.is_active) throw new AppError("Akun tidak aktif", 403);
  await authQuery.updateLastLogin(user.id);
  const userData = { id: user.id, username: user.username, role: user.role };
  return { token: generateToken(userData), user: userData };
};

module.exports = { register, login };
