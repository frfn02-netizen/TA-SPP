const transaksiService = require("./transaksi.service");

const create = async (req, res, next) => {
  try {
    const transaksi = await transaksiService.create(req.body);

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
    const transaksi = await transaksiService.getAll();

    res.json({
      success: true,
      data: transaksi,
    });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const transaksi = await transaksiService.getById(req.params.id);

    res.json({
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
      await transaksiService.handleWebhook(req.body);

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