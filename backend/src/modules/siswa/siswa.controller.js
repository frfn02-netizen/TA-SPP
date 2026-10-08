const siswaService = require("./siswa.service");
const response = require("../../utils/response");

const getAll = async (req, res, next) => {
    try {
        const result = await siswaService.getAll();
        response.success(res, result);
    } catch (err) {
        next(err);
    }
};

const getById = async (req, res, next) => {
    try {
        const result = await siswaService.getById(req.params.id);
        response.success(res, result);
    } catch (err) {
        next(err);
    }
};

const create = async (req, res, next) => {
    try {
        const result = await siswaService.create(req.body);

        response.success(
            res,
            result,
            "Siswa berhasil ditambahkan",
            201
        );
    } catch (err) {
        next(err);
    }
};

const update = async (req, res, next) => {
    try {
        const result = await siswaService.update(
            req.params.id,
            req.body
        );

        response.success(
            res,
            result,
            "Siswa berhasil diperbarui"
        );
    } catch (err) {
        next(err);
    }
};

const remove = async (req, res, next) => {
    try {
        await siswaService.remove(req.params.id);

        response.success(
            res,
            null,
            "Siswa berhasil dihapus"
        );
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove,
};