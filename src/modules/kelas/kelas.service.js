const kelasQuery = require("./kelas.query");
const tahunAjaranQuery = require("../tahunAjaran/tahunAjaran.query");
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

    if (!(await tahunAjaranQuery.findById(data.tahunAjaranId))) {
        throw new AppError("Tahun ajaran tidak ditemukan", 404);
    }

    const kelasExist =
        await kelasQuery.findByNamaKelas(
            data.namaKelas,
            data.tahunAjaranId
        );

    if (kelasExist) {
        throw new AppError("Nama kelas sudah digunakan pada tahun ajaran ini", 409);
    }

    const id = await kelasQuery.create(data);

    return {
        id,
        ...data
    };
};

const update = async (id, data) => {

    const kelas = await kelasQuery.getById(id);

    if (!kelas) {
        throw new AppError("Kelas tidak ditemukan", 404);
    }

    if (!(await tahunAjaranQuery.findById(data.tahunAjaranId))) {
        throw new AppError("Tahun ajaran tidak ditemukan", 404);
    }

    const kelasExist =
        await kelasQuery.findByNamaKelas(
            data.namaKelas,
            data.tahunAjaranId
        );

    if (kelasExist && kelasExist.id != id) {
        throw new AppError("Nama kelas sudah digunakan pada tahun ajaran ini", 409);
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
