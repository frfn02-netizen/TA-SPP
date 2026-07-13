const db = require("../../config/database");

const getAll = async () => {
    const [rows] = await db.execute(`
        SELECT *
        FROM tahun_ajaran
        ORDER BY id DESC
    `);

    return rows;
};

const create = async (data) => {

    const [result] = await db.execute(
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

const deactivateAll = async () => {

    await db.execute(`
        UPDATE tahun_ajaran
        SET aktif = FALSE
    `);

};

const activate = async (id) => {

    await db.execute(
        `
        UPDATE tahun_ajaran
        SET aktif = TRUE
        WHERE id = ?
        `,
        [id]
    );

};

module.exports = {
    getAll,
    create,
    deactivateAll,
    activate
};