const service = require("./tahunAjaran.service");
const response = require("../../utils/response");

const getAll = async (req, res) => {

    try {

        const result = await service.getAll();

        response.success(res, result);

    } catch (err) {

        response.error(res, err.message);

    }

};

const create = async (req, res) => {

    try {

        const result = await service.create(req.body);

        response.success(
            res,
            result,
            "The academic year has been successfully created."
        );

    } catch (err) {

        response.error(res, err.message);

    }

};

const activate = async (req, res) => {

    try {

        await service.activate(req.params.id);

        response.success(
            res,
            null,
            "The academic year has been successfully activated."
        );

    } catch (err) {

        response.error(res, err.message);

    }

};

module.exports = {
    getAll,
    create,
    activate
};