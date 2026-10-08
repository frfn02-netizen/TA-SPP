const db = require("../../config/database");
const { hashPassword } = require("../../utils/hash");
const siswaQuery = require("./siswa.query");
const authQuery = require("../auth/auth.query");
const kelasQuery = require("../kelas/kelas.query");

const AppError = require("../../utils/app-error");

const getAll = async () => {
    return await siswaQuery.getAll();
};

const getById = async (id) => {
    const siswa = await siswaQuery.getById(id);

    if (!siswa) {
        throw new AppError("Siswa tidak ditemukan", 404);
    }

    return siswa;
};

const create = async (data) => {

    if (await siswaQuery.findByNisn(data.nisn)) {
        throw new AppError("NISN sudah terdaftar", 409);
    }

    if (await authQuery.findByUsername(data.nisn)) {
        throw new AppError("Username sudah digunakan", 409);
    }

    const kelas = await kelasQuery.getById(data.kelasId);

    if (!kelas) {
        throw new AppError("Kelas tidak ditemukan", 404);
    }

    const conn = await db.getConnection();

    try {

        await conn.beginTransaction();

        const userId = await authQuery.createUser(
            conn,
            {
                username: data.nisn,
                password: await hashPassword(data.nisn),
                role: "SISWA",
            }
        );

        const siswaId = await siswaQuery.create(
            conn,
            {
                ...data,
                userId,
            }
        );

        await conn.commit();

        return await siswaQuery.getById(siswaId);

    } catch (err) {

        await conn.rollback();
        throw err;

    } finally {

        conn.release();

    }
};

const update = async (id, data) => {

    const siswa = await siswaQuery.getById(id);

    if (!siswa) {
        throw new AppError("Siswa tidak ditemukan", 404);
    }

    const kelas = await kelasQuery.getById(data.kelasId);

    if (!kelas) {
        throw new AppError("Kelas tidak ditemukan", 404);
    }

    const siswaExist = await siswaQuery.findByNisn(data.nisn);

    if (siswaExist && siswaExist.id !== Number(id)) {
        throw new AppError("NISN sudah terdaftar", 409);
    }

    const conn = await db.getConnection();

    try {

        await conn.beginTransaction();

        // Update username jika NISN berubah
        if (siswa.nisn !== data.nisn) {
            await conn.execute(
                `
                UPDATE users
                SET username = ?
                WHERE id = ?
                `,
                [
                    data.nisn,
                    siswa.user_id
                ]
            );
        }

        await siswaQuery.update(
            conn,
            id,
            data
        );

        await conn.commit();

        return await siswaQuery.getById(id);

    } catch (err) {

        await conn.rollback();
        throw err;

    } finally {

        conn.release();

    }
};

const remove = async (id) => {
    const siswa = await siswaQuery.getById(id);

    if (!siswa) {
        throw new AppError("Siswa tidak ditemukan", 404);
    }

    const conn = await db.getConnection();

    try {
        await conn.beginTransaction();

        await siswaQuery.remove(conn, id);

        await conn.execute(
            `
            DELETE FROM users
            WHERE id = ?
            `,
            [siswa.user_id]
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