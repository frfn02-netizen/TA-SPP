const db = require("../../config/database");

const getAll = async () => {
  const [rows] = await db.execute(`
    SELECT s.id, s.nisn, s.nama, s.no_telp_ortu, u.username,
           k.id AS kelas_id, k.nama_kelas, k.tingkat, k.jurusan
    FROM siswa s
    JOIN users u ON u.id = s.user_id
    JOIN kelas k ON k.id = s.kelas_id
    ORDER BY s.nama ASC
  `);
  return rows;
};

const getById = async (id) => {
  const [rows] = await db.execute(`
    SELECT s.*, u.username, k.nama_kelas, k.tingkat, k.jurusan
    FROM siswa s
    JOIN users u ON u.id = s.user_id
    JOIN kelas k ON k.id = s.kelas_id
    WHERE s.id = ?
  `, [id]);
  return rows[0];
};

const findByNisn = async (nisn) => {
  const [rows] = await db.execute("SELECT id FROM siswa WHERE nisn = ? LIMIT 1", [nisn]);
  return rows[0];
};

const findKelasById = async (id) => {
  const [rows] = await db.execute("SELECT id FROM kelas WHERE id = ? LIMIT 1", [id]);
  return rows[0];
};

const create = async (conn, { userId, nisn, nama, kelasId, noTelpOrtu }) => {
  const [result] = await conn.execute(
    "INSERT INTO siswa (user_id, kelas_id, nisn, nama, no_telp_ortu) VALUES (?, ?, ?, ?, ?)",
    [userId, kelasId, nisn, nama, noTelpOrtu || null],
  );
  return result.insertId;
};

module.exports = { getAll, getById, findByNisn, findKelasById, create };
