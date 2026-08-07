const db = require("../../config/database");

const getAll = async () => {
    const [rows] = await db.execute(
        `
        SELECT
            id,
            tingkat,
            jurusan,
            created_at,
            updated_at
        FROM kelas
        ORDER BY tingkat, jurusan
        `
    );

    return rows;
};

const getById = async (id) => {
    const [rows] = await db.execute(
        `
        SELECT
            id,
            tingkat,
            jurusan,
            created_at,
            updated_at
        FROM kelas
        WHERE id = ?
        `,
        [id]
    );

    return rows[0];
};

const findByKelas = async (tingkat, jurusan) => {
    const [rows] = await db.execute(
        `
        SELECT *
        FROM kelas
        WHERE tingkat = ?
          AND jurusan = ?
        LIMIT 1
        `,
        [tingkat, jurusan]
    );

    return rows[0];
};

const create = async (data) => {
    const [result] = await db.execute(
        `
        INSERT INTO kelas
        (
            tingkat,
            jurusan
        )
        VALUES (?, ?)
        `,
        [
            data.tingkat,
            data.jurusan
        ]
    );

    return result.insertId;
};

const update = async (id, data) => {
    await db.execute(
        `
        UPDATE kelas
        SET
            tingkat = ?,
            jurusan = ?
        WHERE id = ?
        `,
        [
            data.tingkat,
            data.jurusan,
            id
        ]
    );
};

const remove = async (id) => {
    await db.execute(
        `
        DELETE FROM kelas
        WHERE id = ?
        `,
        [id]
    );
};

const countSiswa = async (kelasId) => {
    const [rows] = await db.execute(
        `
        SELECT COUNT(*) AS total
        FROM siswa
        WHERE kelas_id = ?
        `,
        [kelasId]
    );

    return rows[0].total;
};

module.exports = {
    getAll,
    getById,
    findByKelas,
    create,
    update,
    remove,
    countSiswa
};
