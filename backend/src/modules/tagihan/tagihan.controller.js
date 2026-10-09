const tagihanService = require("./tagihan.service");
const response = require("../../utils/response");
const { bulkPreviewSchema } = require("./tagihan.validation");

const getAll = async (req, res, next) => {
    try {
        const result = await tagihanService.getAll(req.user);
        response.success(res, result);
    } catch (err) {
        next(err);
    }
};

const getById = async (req, res, next) => {
    try {
        const result = await tagihanService.getById(
            req.params.id,
            req.user
        );

        response.success(res, result);
    } catch (err) {
        next(err);
    }
};

const create = async (req, res, next) => {
    try {
        const result = await tagihanService.create(req.body);

        response.success(
            res,
            result,
            "Tagihan berhasil dibuat",
            201
        );

    } catch (err) {
        next(err);
    }
};

const update = async (req, res, next) => {
    try {
        const result = await tagihanService.update(
            req.params.id,
            req.body
        );

        response.success(
            res,
            result,
            "Tagihan berhasil diperbarui"
        );

    } catch (err) {
        next(err);
    }
};

const remove = async (req, res, next) => {
    try {

        await tagihanService.remove(req.params.id);

        response.success(
            res,
            null,
            "Tagihan berhasil dihapus"
        );

    } catch (err) {
        next(err);
    }
};

const bulkPreview = async (req, res, next) => {
    try {

        const input = bulkPreviewSchema.parse(
            req.query
        );

        const result =
            await tagihanService.bulkPreview(input);

        response.success(res, result);

    } catch (err) {
        next(err);
    }
};

const bulkGenerate = async (req, res, next) => {
    try {

        const result =
            await tagihanService.bulkGenerate(req.body);

        response.success(
            res,
            result,
            "Tagihan massal berhasil diproses",
            201
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
    bulkPreview,
    bulkGenerate,
};