const db = require("../../config/database");

const tagihanQuery = require("./tagihan.query");

const AppError = require("../../utils/app-error");

const getAll = async (user) => {

    if (user.role === "ADMIN") {
        return await tagihanQuery.getAll();
    }

    return await tagihanQuery.getByUserId(user.id);

};

const getById = async (
    id,
    user
) => {

    let tagihan;

    if (user.role === "ADMIN") {

        tagihan =
            await tagihanQuery.getById(id);

    } else {

        tagihan =
            await tagihanQuery.getByIdAndUserId(
                id,
                user.id
            );
    }

    if (!tagihan) {
        throw new AppError(
            "Tagihan tidak ditemukan",
            404
        );
    }

    return tagihan;

};
const create = async (data) => {

    if (!(await tagihanQuery.siswaExists(data.siswaId))) {
        throw new AppError("Siswa tidak ditemukan", 404);
    }

    if (!(await tagihanQuery.tahunAjaranExists(data.tahunAjaranId))) {
        throw new AppError("Tahun ajaran tidak ditemukan", 404);
    }

    const duplicate = await tagihanQuery.findDuplicate(
        data.siswaId,
        data.tahunAjaranId,
        data.bulan,
        data.tahun
    );

    if (duplicate) {
        throw new AppError(
            "Tagihan bulan tersebut sudah ada",
            409
        );
    }

    const conn = await db.getConnection();

    try {

        await conn.beginTransaction();

        const id = await tagihanQuery.create(
            conn,
            data
        );

        await conn.commit();

        return await tagihanQuery.getById(id);

    } catch (err) {

        await conn.rollback();
        throw err;

    } finally {

        conn.release();

    }

};

const update = async (id, data) => {

    const tagihan = await tagihanQuery.getById(id);

    if (!tagihan) {
        throw new AppError(
            "Tagihan tidak ditemukan",
            404
        );
    }

    if (!(await tagihanQuery.siswaExists(data.siswaId))) {
        throw new AppError(
            "Siswa tidak ditemukan",
            404
        );
    }

    if (!(await tagihanQuery.tahunAjaranExists(data.tahunAjaranId))) {
        throw new AppError(
            "Tahun ajaran tidak ditemukan",
            404
        );
    }

    const duplicate =
        await tagihanQuery.findDuplicate(
            data.siswaId,
            data.tahunAjaranId,
            data.bulan,
            data.tahun
        );

    if (duplicate && duplicate.id !== Number(id)) {
        throw new AppError(
            "Tagihan bulan tersebut sudah ada",
            409
        );
    }

    const conn = await db.getConnection();

    try {

        await conn.beginTransaction();

        await tagihanQuery.update(
            conn,
            id,
            data
        );

        await conn.commit();

        return await tagihanQuery.getById(id);

    } catch (err) {

        await conn.rollback();

        throw err;

    } finally {

        conn.release();

    }

};

const remove = async (id) => {

    const tagihan = await tagihanQuery.getById(id);

    if (!tagihan) {
        throw new AppError(
            "Tagihan tidak ditemukan",
            404
        );
    }

    const conn = await db.getConnection();

    try {

        await conn.beginTransaction();

        await tagihanQuery.remove(
            conn,
            id
        );

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
    getById,
    create,
    update,
    remove,
};