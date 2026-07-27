const db = require("../../config/database");

const getAll = async () => {

    const [rows] = await db.execute(`
        SELECT

            s.id,

            s.nisn,

            s.nama,

            k.nama_kelas,

            u.username,

            s.no_telp_ortu

        FROM siswa s

        JOIN users u
            ON s.user_id = u.id

        JOIN kelas k
            ON s.kelas_id = k.id

        ORDER BY s.nama ASC
    `);

    return rows;
};

const getById = async (id) => {

    const [rows] = await db.execute(
        `
        SELECT

            s.*,

            u.username,

            k.nama_kelas

        FROM siswa s

        JOIN users u
            ON s.user_id = u.id

        JOIN kelas k
            ON s.kelas_id = k.id

        WHERE s.id = ?
        `,
        [id]
    );

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

const create = async (conn, data) => {

    const [result] = await conn.execute(
        `
        INSERT INTO siswa(

            user_id,

            kelas_id,

            nisn,

            nama,

            no_telp_ortu

        )

        VALUES(?,?,?,?,?)
        `,
        [

            data.userId,

            data.kelasId,

            data.nisn,

            data.nama,

            data.noTelpOrtu || null

        ]
    );

    return result.insertId;

};
module.exports = { getAll, getById, findByNisn, findKelasById, create };
