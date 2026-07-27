const transaksiQuery = require("./transaksi.query");
const tagihanQuery = require("../tagihan/tagihan.query");
const paymentService = require("../../services/payment/payment.service");
const AppError = require("../../utils/app-error");
const generateOrderId = require("../../utils/generate-order-id");

const create = async (data) => {
  const tagihan = await tagihanQuery.findById(data.tagihanId);

  if (!tagihan) {
    throw new AppError("Tagihan tidak ditemukan", 404);
  }
  if (tagihan.status === "LUNAS") {
    throw new AppError("Tagihan sudah lunas", 400);
  }
  const existingTransaction = await transaksiQuery.findByTagihanId(
    data.tagihanId
  );

  if (existingTransaction) {
    throw new AppError("Transaksi untuk tagihan ini sudah ada", 400);
  }
  const orderId = generateOrderId();
  const id = await transaksiQuery.create({
    tagihanId: tagihan.id,
    orderId,
    grossAmount: tagihan.nominal,
  });
  const payment = await paymentService.createPayment({
  orderId,
  grossAmount: tagihan.nominal,
  customer: {
    nama: tagihan.nama,
    email: tagihan.email,
  },
});

await transaksiQuery.updatePayment({
  id,
  snapToken: payment.snapToken,
  paymentUrl: payment.paymentUrl,
});

  return {
  id,
  orderId,
  tagihanId: tagihan.id,
  grossAmount: tagihan.nominal,
  transactionStatus: "PENDING",
  snapToken: payment.snapToken,
  paymentUrl: payment.paymentUrl,
};
};

const getAll = async () => {
  return transaksiQuery.findAll();
};

const getById = async (id) => {
  const transaksi = await transaksiQuery.findById(id);

  if (!transaksi) {
    throw new AppError("Transaksi tidak ditemukan", 404);
  }

  return transaksi;
};

module.exports = {
  create,
  getAll,
  getById,
};