const tahunAjaranQuery = require("./tahunAjaran.query");
const db = require("../../config/database");
const AppError = require("../../utils/app-error");

const getAll = async () => {
    return await tahunAjaranQuery.getAll();
};

const create = async (data) => {

    const conn = await db.getConnection();

    try {
        await conn.beginTransaction();

        if (data.aktif) {
            await tahunAjaranQuery.deactivateAll(conn);
        }

        const id = await tahunAjaranQuery.create(data, conn);

        await conn.commit();

        return {
            id,
            ...data
        };
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }

};

const activate = async (id) => {

    const conn = await db.getConnection();

    try {
        await conn.beginTransaction();

        if (!(await tahunAjaranQuery.findById(id, conn))) {
            throw new AppError("Tahun ajaran tidak ditemukan", 404);
        }

        await tahunAjaranQuery.deactivateAll(conn);

        await tahunAjaranQuery.activate(id, conn);

        await conn.commit();
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }

};

module.exports = {
    getAll,
    create,
    activate
};
