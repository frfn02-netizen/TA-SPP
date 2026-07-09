const db = require("../../config/database");

const getAll = async () => {
    const [rows] = await db.execute(`
        SELECT
            s.id,
            s.nisn,
            s.nama,
            s.kelas,
            s.no_telp_ortu,
            u.username
        FROM siswa s
        JOIN users u
            ON s.user_id = u.id
        ORDER BY s.nama ASC
    `);

    return rows;
};

const getById = async (id) => {

    const [rows] = await db.execute(
        `
        SELECT
            s.*,
            u.username
        FROM siswa s
        JOIN users u
            ON s.user_id=u.id
        WHERE s.id=?
        `,
        [id]
    );

    return rows[0];
};

module.exports = {
    getAll,
    getById
};