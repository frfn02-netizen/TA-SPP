const service = require("./tahunAjaran.service");
const response = require("../../utils/response");

const getAll = async (req, res, next) => {

    try {

        const result = await service.getAll();

        response.success(res, result);

    } catch (err) {

        next(err);

    }

};

const create = async (req, res, next) => {

    try {

        const result = await service.create(req.body);

        response.success(
            res,
            result,
            "The academic year has been successfully created."
        );

    } catch (err) {

        next(err);

    }

};

const activate = async (req, res, next) => {

    try {

        await service.activate(req.params.id);

        response.success(
            res,
            null,
            "The academic year has been successfully activated."
        );

    } catch (err) {

        next(err);

    }

};

module.exports = {
    getAll,
    create,
    activate
};
