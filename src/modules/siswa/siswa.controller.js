const siswaService = require("./siswa.service");
const response = require("../../utils/response");

const getAll = async (req, res, next) => {
  try { return response.success(res, await siswaService.getAll()); } catch (error) { next(error); }
};
const getById = async (req, res, next) => {
  try { return response.success(res, await siswaService.getById(req.params.id)); } catch (error) { next(error); }
};
const create = async (req, res, next) => {
  try { return response.success(res, await siswaService.create(req.body), "Siswa berhasil dibuat", 201); } catch (error) { next(error); }
};

module.exports = { getAll, getById, create };
