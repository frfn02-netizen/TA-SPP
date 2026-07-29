const transaksiService = require("./transaksi.service");

const create = async (req, res, next) => {
    try {

        const transaksi =
            await transaksiService.create(
                req.body,
                req.user
            );

        res.status(201).json({
            success: true,
            message: "Transaksi berhasil dibuat",
            data: transaksi,
        });

    } catch (error) {
        next(error);
    }
};

const getAll = async (req, res, next) => {
    try {

        const transaksi =
            await transaksiService.getAll(
                req.user
            );

        res.status(200).json({
            success: true,
            data: transaksi,
        });

    } catch (error) {
        next(error);
    }
};

const getById = async (req, res, next) => {
    try {

        const transaksi =
            await transaksiService.getById(
                req.params.id,
                req.user
            );

        res.status(200).json({
            success: true,
            data: transaksi,
        });

    } catch (error) {
        next(error);
    }
};

const webhook = async (req, res, next) => {
    try {

        const result =
            await transaksiService.handleWebhook(
                req.body
            );

        res.status(200).json({
            success: true,
            message: "Webhook berhasil diproses",
            data: result,
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    create,
    getAll,
    getById,
    webhook,
};