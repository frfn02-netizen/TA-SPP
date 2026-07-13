const db = require("../../config/database");
const { hashPassword } = require("../../utils/hash");
const siswaQuery = require("./siswa.query");
const authQuery = require("../auth/auth.query");
const AppError = require("../../utils/app-error");

const getAll = () => siswaQuery.getAll();

const getById = async (id) => {
  const siswa = await siswaQuery.getById(id);
  if (!siswa) throw new AppError("Siswa tidak ditemukan", 404);
  return siswa;
};

const create = async (data) => {
  if (await siswaQuery.findByNisn(data.nisn)) throw new AppError("NISN sudah terdaftar", 409);
  if (await authQuery.findByUsername(data.nisn)) throw new AppError("Username sudah digunakan", 409);
  if (!(await siswaQuery.findKelasById(data.kelasId))) throw new AppError("Kelas tidak ditemukan", 404);

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const userId = await authQuery.createUser(conn, {
      username: data.nisn,
      password: await hashPassword(data.nisn),
      role: "SISWA",
    });
    const id = await siswaQuery.create(conn, { ...data, userId });
    await conn.commit();
    return { id, username: data.nisn, defaultPassword: data.nisn };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

module.exports = { getAll, getById, create };
