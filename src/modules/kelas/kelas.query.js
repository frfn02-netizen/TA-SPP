const db = require("../../config/database");

const getAll = async () => {

    const [rows] = await db.execute(
        `
        SELECT
            k.id,
            k.nama_kelas,
            k.tingkat,
            k.jurusan,
            k.wali_kelas,
            t.nama AS tahun_ajaran
        FROM kelas k
        JOIN tahun_ajaran t
            ON k.tahun_ajaran_id = t.id
        ORDER BY k.nama_kelas ASC
        `
    );

    return rows;
};

const getById = async (id) => {

    const [rows] = await db.execute(
        `
        SELECT
            k.*,
            t.nama AS tahun_ajaran
        FROM kelas k
        JOIN tahun_ajaran t
            ON k.tahun_ajaran_id = t.id
        WHERE k.id = ?
        `,
        [id]
    );

    return rows[0];
};

const findByNamaKelas = async (namaKelas, tahunAjaranId) => {

    const [rows] = await db.execute(
        `
        SELECT *
        FROM kelas
        WHERE nama_kelas = ?
        AND tahun_ajaran_id = ?
        LIMIT 1
        `,
        [namaKelas, tahunAjaranId]
    );

    return rows[0];
};

const create = async (data) => {

    const [result] = await db.execute(
        `
        INSERT INTO kelas
        (
            tahun_ajaran_id,
            nama_kelas,
            tingkat,
            jurusan,
            wali_kelas
        )
        VALUES
        (?, ?, ?, ?, ?)
        `,
        [
            data.tahunAjaranId,
            data.namaKelas,
            data.tingkat,
            data.jurusan,
            data.waliKelas
        ]
    );

    return result.insertId;
};

const update = async (id, data) => {

    await db.execute(
        `
        UPDATE kelas
        SET
            tahun_ajaran_id = ?,
            nama_kelas = ?,
            tingkat = ?,
            jurusan = ?,
            wali_kelas = ?
        WHERE id = ?
        `,
        [
            data.tahunAjaranId,
            data.namaKelas,
            data.tingkat,
            data.jurusan,
            data.waliKelas,
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
    findByNamaKelas,
    create,
    update,
    remove,
    countSiswa
};