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

    const kelas = await kelasQuery.getById(
        data.kelasId
    );

    if (!kelas) {
        throw new AppError(
            "Kelas tidak ditemukan",
            404
        );
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

        return {
            id: siswaId,
            username: data.nisn,
            kelasId: data.kelasId,
        };

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
};
