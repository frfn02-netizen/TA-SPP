const db = require("../../config/database");

const getAll = async () => {
    const [rows] = await db.execute(`
        SELECT
            t.id,
            t.siswa_id,
            t.tahun_ajaran_id,
            t.bulan,
            t.tahun,
            t.nominal,
            t.jatuh_tempo,
            t.status,
            t.keterangan,
            t.created_at,
            t.updated_at,

            s.nisn,
            s.nama,

            k.id AS kelas_id,
            k.tingkat,
            k.jurusan,

            ta.nama AS tahun_ajaran,
            ta.semester

        FROM tagihan t

        JOIN siswa s
            ON s.id = t.siswa_id

        JOIN kelas k
            ON k.id = s.kelas_id

        JOIN tahun_ajaran ta
            ON ta.id = t.tahun_ajaran_id

        ORDER BY
            t.jatuh_tempo DESC,
            s.nama ASC
    `);

    return rows;
};

const getByUserId = async (userId) => {
    const [rows] = await db.execute(
        `
        SELECT
            t.id,
            t.bulan,
            t.tahun,
            t.nominal,
            t.jatuh_tempo,
            t.status,
            t.keterangan,

            ta.nama AS tahun_ajaran,
            ta.semester

        FROM tagihan t

        JOIN siswa s
            ON s.id = t.siswa_id

        JOIN tahun_ajaran ta
            ON ta.id = t.tahun_ajaran_id

        WHERE s.user_id = ?

        ORDER BY
            t.jatuh_tempo DESC
        `,
        [userId]
    );

    return rows;
};

const getById = async (id) => {
    const [rows] = await db.execute(
        `
        SELECT
            t.*,

            s.nama,
            s.nisn,
            s.user_id,

            k.tingkat,
            k.jurusan,

            ta.nama AS tahun_ajaran,
            ta.semester

        FROM tagihan t

        JOIN siswa s
            ON s.id = t.siswa_id

        JOIN kelas k
            ON k.id = s.kelas_id

        JOIN tahun_ajaran ta
            ON ta.id = t.tahun_ajaran_id

        WHERE t.id = ?

        LIMIT 1
        `,
        [id]
    );

    return rows[0];
};

const findDuplicate = async (
    siswaId,
    tahunAjaranId,
    bulan,
    tahun
) => {

    const [rows] = await db.execute(
        `
        SELECT id
        FROM tagihan
        WHERE
            siswa_id = ?
            AND tahun_ajaran_id = ?
            AND bulan = ?
            AND tahun = ?
        LIMIT 1
        `,
        [
            siswaId,
            tahunAjaranId,
            bulan,
            tahun,
        ]
    );

    return rows[0];
};

const siswaExists = async (id) => {
    const [rows] = await db.execute(
        `
        SELECT id
        FROM siswa
        WHERE id = ?
        LIMIT 1
        `,
        [id]
    );

    return rows[0];
};

const tahunAjaranExists = async (id) => {
    const [rows] = await db.execute(
        `
        SELECT id
        FROM tahun_ajaran
        WHERE id = ?
        LIMIT 1
        `,
        [id]
    );

    return rows[0];
};

const create = async (conn, data) => {

    const [result] = await conn.execute(
        `
        INSERT INTO tagihan
        (
            siswa_id,
            tahun_ajaran_id,
            bulan,
            tahun,
            nominal,
            jatuh_tempo,
            status,
            keterangan
        )
        VALUES
        (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            data.siswaId,
            data.tahunAjaranId,
            data.bulan,
            data.tahun,
            data.nominal,
            data.jatuhTempo,
            "BELUM_LUNAS",
            data.keterangan ?? null,
        ]
    );

    return result.insertId;
};

const update = async (conn, id, data) => {

    await conn.execute(
        `
        UPDATE tagihan
        SET
            siswa_id = ?,
            tahun_ajaran_id = ?,
            bulan = ?,
            tahun = ?,
            nominal = ?,
            jatuh_tempo = ?,
            keterangan = ?
        WHERE id = ?
        `,
        [
            data.siswaId,
            data.tahunAjaranId,
            data.bulan,
            data.tahun,
            data.nominal,
            data.jatuhTempo,
            data.keterangan ?? null,
            id,
        ]
    );
};

const updateStatus = async (
    executor,
    id,
    status
) => {

    await executor.execute(
        `
        UPDATE tagihan
        SET status = ?
        WHERE id = ?
        `,
        [
            status,
            id,
        ]
    );
};

const remove = async (
    conn,
    id
) => {

    await conn.execute(
        `
        DELETE FROM tagihan
        WHERE id = ?
        `,
        [id]
    );
};

const getByIdAndUserId = async (id, userId) => {

    const [rows] = await db.execute(
        `
        SELECT
            t.*,

            s.nama,
            s.nisn,

            k.tingkat,
            k.jurusan,

            ta.nama AS tahun_ajaran,
            ta.semester

        FROM tagihan t

        JOIN siswa s
            ON s.id = t.siswa_id

        JOIN kelas k
            ON k.id = s.kelas_id

        JOIN tahun_ajaran ta
            ON ta.id = t.tahun_ajaran_id

        WHERE
            t.id = ?
            AND s.user_id = ?

        LIMIT 1
        `,
        [
            id,
            userId
        ]
    );

    return rows[0];

};

const getTargetSiswa = async (kelasId) => {

    const params = [];
    let where = "";

    if (kelasId) {
        where = "WHERE s.kelas_id = ?";
        params.push(kelasId);
    }

    const [rows] = await db.execute(
        `
        SELECT
            s.id,
            s.nisn,
            s.nama,
            s.kelas_id,
            k.tingkat,
            k.jurusan

        FROM siswa s

        JOIN kelas k
            ON k.id = s.kelas_id

        ${where}

        ORDER BY
            k.tingkat,
            k.jurusan,
            s.nama
        `,
        params
    );

    return rows;

};

const getSiswaIdsByPeriod = async (
    tahunAjaranId,
    bulan,
    tahun
) => {

    const [rows] = await db.execute(
        `
        SELECT siswa_id
        FROM tagihan
        WHERE
            tahun_ajaran_id = ?
            AND bulan = ?
            AND tahun = ?
        `,
        [
            tahunAjaranId,
            bulan,
            tahun,
        ]
    );

    return rows.map((row) => row.siswa_id);

};

const kelasExists = async (id) => {

    const [rows] = await db.execute(
        `
        SELECT id
        FROM kelas
        WHERE id = ?
        LIMIT 1
        `,
        [id]
    );

    return rows[0];

};

const getTahunAjaranById = async (id) => {

    const [rows] = await db.execute(
        `
        SELECT id, nama, semester
        FROM tahun_ajaran
        WHERE id = ?
        LIMIT 1
        `,
        [id]
    );

    return rows[0];

};

module.exports = {
    getAll,
    getByUserId,
    getById,
    findDuplicate,
    siswaExists,
    tahunAjaranExists,
    create,
    update,
    updateStatus,
    remove,
    getByIdAndUserId,
    getTargetSiswa,
    getSiswaIdsByPeriod,
    kelasExists,
    getTahunAjaranById,
};