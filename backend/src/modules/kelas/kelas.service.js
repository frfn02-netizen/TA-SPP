const kelasQuery = require("./kelas.query");
const AppError = require("../../utils/app-error");

const getAll = async () => {
    return await kelasQuery.getAll();
};

const getById = async (id) => {
    const kelas = await kelasQuery.getById(id);

    if (!kelas) {
        throw new AppError("Kelas tidak ditemukan", 404);
    }

    return kelas;
};

const create = async (data) => {
    const kelasExist = await kelasQuery.findByKelas(
        data.tingkat,
        data.jurusan
    );

    if (kelasExist) {
        throw new AppError("Kelas sudah terdaftar", 409);
    }

    const id = await kelasQuery.create(data);

    return await kelasQuery.getById(id);
};

const update = async (id, data) => {
    const kelas = await kelasQuery.getById(id);

    if (!kelas) {
        throw new AppError("Kelas tidak ditemukan", 404);
    }

    const kelasExist = await kelasQuery.findByKelas(
        data.tingkat,
        data.jurusan
    );

    if (kelasExist && kelasExist.id !== Number(id)) {
        throw new AppError("Kelas sudah terdaftar", 409);
    }

    await kelasQuery.update(id, data);

    return await kelasQuery.getById(id);
};

const remove = async (id) => {
    const kelas = await kelasQuery.getById(id);

    if (!kelas) {
        throw new AppError("Kelas tidak ditemukan", 404);
    }

    const total = await kelasQuery.countSiswa(id);

    if (total > 0) {
        throw new AppError("Kelas masih memiliki siswa", 409);
    }

    await kelasQuery.remove(id);
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove,
};