const siswaService = require("./siswa.service");
const response = require("../../utils/response");

const getAll = async (req, res) => {

    try {

        const result = await siswaService.getAll();

        response.success(res, result);

    } catch (err) {

        response.error(res, err.message);

    }

};

const getById = async (req, res) => {

    try {

        const result = await siswaService.getById(
            req.params.id
        );

        response.success(res, result);

    } catch (err) {

        response.error(res, err.message);

    }

};

module.exports = {
    getAll,
    getById
};