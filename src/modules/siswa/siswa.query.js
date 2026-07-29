const db = require("../../config/database");

const getAll = async () => {
    const [rows] = await db.execute(`
        SELECT
            s.id,
            s.nisn,
            s.nama,
            s.jenis_kelamin,
            s.alamat,
            s.no_hp,

            u.username,

            k.id AS kelas_id,
            k.tingkat,
            k.jurusan,
            k.rombel

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
            s.id,
            s.user_id,
            s.kelas_id,
            s.nisn,
            s.nama,
            s.jenis_kelamin,
            s.alamat,
            s.no_hp,

            u.username,

            k.tingkat,
            k.jurusan,
            k.rombel

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
    const [rows] = await db.execute(
        `
        SELECT id
        FROM siswa
        WHERE nisn = ?
        LIMIT 1
        `,
        [nisn]
    );

    return rows[0];
};

const create = async (conn, data) => {
    const [result] = await conn.execute(
        `
        INSERT INTO siswa
        (
            user_id,
            kelas_id,
            nisn,
            nama,
            jenis_kelamin,
            alamat,
            no_hp
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
            data.userId,
            data.kelasId,
            data.nisn,
            data.nama,
            data.jenisKelamin,
            data.alamat,
            data.noHp,
        ]
    );

    return result.insertId;
};

const update = async (conn, id, data) => {
    await conn.execute(
        `
        UPDATE siswa
        SET
            kelas_id = ?,
            nisn = ?,
            nama = ?,
            jenis_kelamin = ?,
            alamat = ?,
            no_hp = ?
        WHERE id = ?
        `,
        [
            data.kelasId,
            data.nisn,
            data.nama,
            data.jenisKelamin,
            data.alamat,
            data.noHp,
            id,
        ]
    );
};

const remove = async (conn, id) => {
    await conn.execute(
        `
        DELETE FROM siswa
        WHERE id = ?
        `,
        [id]
    );
};

module.exports = {
    getAll,
    getById,
    findByNisn,
    create,
    update,
    remove,
};