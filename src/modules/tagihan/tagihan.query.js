const db = require("../../config/database");

const getAll = async () => {
  const [rows] = await db.execute(`
    SELECT t.*, s.nisn, s.nama, ta.nama AS tahun_ajaran
    FROM tagihan t
    JOIN siswa s ON s.id = t.siswa_id
    JOIN tahun_ajaran ta ON ta.id = t.tahun_ajaran_id
    ORDER BY t.jatuh_tempo DESC, s.nama ASC
  `);
  return rows;
};

const getByUserId = async (userId) => {
  const [rows] = await db.execute(`
    SELECT t.*, ta.nama AS tahun_ajaran
    FROM tagihan t
    JOIN siswa s ON s.id = t.siswa_id
    JOIN tahun_ajaran ta ON ta.id = t.tahun_ajaran_id
    WHERE s.user_id = ?
    ORDER BY t.jatuh_tempo DESC
  `, [userId]);
  return rows;
};

const siswaExists = async (id) => {
  const [rows] = await db.execute("SELECT id FROM siswa WHERE id = ? LIMIT 1", [id]);
  return rows[0];
};

const tahunAjaranExists = async (id) => {
  const [rows] = await db.execute("SELECT id FROM tahun_ajaran WHERE id = ? LIMIT 1", [id]);
  return rows[0];
};

const createTagihan = async ({ siswaId, tahunAjaranId, bulan, tahun, nominal, jatuhTempo, keterangan }) => {
  const [result] = await db.execute(`
    INSERT INTO tagihan (siswa_id, tahun_ajaran_id, bulan, tahun, nominal, jatuh_tempo, keterangan)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [siswaId, tahunAjaranId, bulan, tahun, nominal, jatuhTempo, keterangan || null]);
  return result.insertId;
};

module.exports = { getAll, getByUserId, siswaExists, tahunAjaranExists, createTagihan };
