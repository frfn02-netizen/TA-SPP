const db = require("../../config/database");

const getAll = async () => {
    const [rows] = await db.execute(`
        SELECT *
        FROM tahun_ajaran
        ORDER BY id DESC
    `);

    return rows;
};

const findById = async (id, conn = db) => {
    const [rows] = await conn.execute(
        "SELECT id FROM tahun_ajaran WHERE id = ? LIMIT 1",
        [id]
    );

    return rows[0];
};

const create = async (data, conn = db) => {

    const [result] = await conn.execute(
        `
        INSERT INTO tahun_ajaran
        (
            nama,
            aktif
        )
        VALUES (?,?)
        `,
        [
            data.nama,
            data.aktif
        ]
    );

    return result.insertId;

};

const deactivateAll = async (conn = db) => {

    await conn.execute(`
        UPDATE tahun_ajaran
        SET aktif = FALSE
    `);

};

const activate = async (id, conn = db) => {

    const [result] = await conn.execute(
        `
        UPDATE tahun_ajaran
        SET aktif = TRUE
        WHERE id = ?
        `,
        [id]
    );

    return result.affectedRows;

};

module.exports = {
    getAll,
    findById,
    create,
    deactivateAll,
    activate
};
