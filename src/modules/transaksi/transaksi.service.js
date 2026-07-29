const db = require("../../config/database");

const transaksiQuery = require("./transaksi.query");
const tagihanQuery = require("../tagihan/tagihan.query");

const paymentService = require("../../services/payment/payment.service");
const mapStatus = require("../../services/payment/payment-status.helper");
const generateOrderId = require("../../utils/generate-order-id");
const AppError = require("../../utils/app-error");

const create = async ({ tagihanId }) => {
  const tagihan = await tagihanQuery.findById(tagihanId);

  if (!tagihan) {
    throw new AppError("Tagihan tidak ditemukan", 404);
  }

  if (tagihan.status === "LUNAS") {
    throw new AppError("Tagihan sudah lunas", 400);
  }

  const existing = await transaksiQuery.findByTagihanId(tagihanId);

  if (existing) {
    return {
      id: existing.id,
      orderId: existing.order_id,
      transactionStatus: existing.transaction_status,
      snapToken: existing.snap_token,
      paymentUrl: existing.payment_url,
    };
  }

  const orderId = generateOrderId();

  // Midtrans dulu
  const payment = await paymentService.createPayment({
    orderId,
    grossAmount: Number(tagihan.nominal),
    customer: {
      nama: tagihan.nama,
    },
  });

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const transaksiId = await transaksiQuery.create(
      connection,
      {
        tagihanId,
        orderId,
        grossAmount: tagihan.nominal,
        snapToken: payment.snapToken,
        paymentUrl: payment.paymentUrl,
        transactionStatus: "PENDING",
      }
    );

    await connection.commit();

    return {
      id: transaksiId,
      orderId,
      transactionStatus: "PENDING",
      snapToken: payment.snapToken,
      paymentUrl: payment.paymentUrl,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const getAll = async () => {
  return transaksiQuery.findAll();
};

const getById = async (id) => {
  const transaksi = await transaksiQuery.findById(id);

  if (!transaksi) {
    throw new AppError(
      "Transaksi tidak ditemukan",
      404
    );
  }

  return transaksi;
};

const handleWebhook = async (notification) => {
  const status = await paymentService.handleNotification(
    notification
  );

  const transaksi =
    await transaksiQuery.findByOrderId(
      status.order_id
    );

  if (!transaksi) {
    throw new AppError(
      "Transaksi tidak ditemukan",
      404
    );
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const transactionStatus = mapStatus(
      status.transaction_status
    );

    await transaksiQuery.updateStatus(
      connection,
      {
        orderId: status.order_id,
        transactionStatus,
        paymentType: status.payment_type,
        transactionTime:
          status.transaction_time,
        settlementTime:
          status.settlement_time,
        paidAt:
          transactionStatus ===
          "SETTLEMENT"
            ? new Date()
            : null,
        midtransResponse: status,
      }
    );

    if (
      transactionStatus ===
      "SETTLEMENT"
    ) {
      await tagihanQuery.updateStatus(
        connection,
        transaksi.tagihan_id,
        "LUNAS"
      );
    }

    await connection.commit();

    return {
      orderId: status.order_id,
      transactionStatus,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  create,
  getAll,
  getById,
  handleWebhook,
};