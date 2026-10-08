const kelasService = require("./kelas.service");
const response = require("../../utils/response");

const getAll = async (req, res, next) => {
    try {
        const result = await kelasService.getAll();

        response.success(res, result);
    } catch (err) {
        next(err);
    }
};

const getById = async (req, res, next) => {
    try {
        const result = await kelasService.getById(req.params.id);

        response.success(res, result);
    } catch (err) {
        next(err);
    }
};

const create = async (req, res, next) => {
    try {
        const result = await kelasService.create(req.body);

        response.success(
            res,
            result,
            "Kelas berhasil ditambahkan",
            201
        );
    } catch (err) {
        next(err);
    }
};

const update = async (req, res, next) => {
    try {
        const result = await kelasService.update(
            req.params.id,
            req.body
        );

        response.success(
            res,
            result,
            "Kelas berhasil diperbarui"
        );
    } catch (err) {
        next(err);
    }
};

const remove = async (req, res, next) => {
    try {
        await kelasService.remove(req.params.id);

        response.success(
            res,
            null,
            "Kelas berhasil dihapus"
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
