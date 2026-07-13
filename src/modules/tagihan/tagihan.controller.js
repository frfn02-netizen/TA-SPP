const tagihanService = require("./tagihan.service");
const response = require("../../utils/response");

const getAll = async (req, res, next) => {
  try { return response.success(res, await tagihanService.getAll(req.user)); } catch (error) { next(error); }
};
const create = async (req, res, next) => {
  try { return response.success(res, await tagihanService.create(req.body), "Tagihan berhasil dibuat", 201); } catch (error) { next(error); }
};

module.exports = { getAll, create };
