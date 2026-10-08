const snap = require("./midtrans.service");
const AppError = require("../../utils/app-error");

const createPayment = async ({
  orderId,
  grossAmount,
  customer,
}) => {
  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: Number(grossAmount),
    },

    customer_details: {
      first_name: customer?.nama ?? "Siswa",
    },

    enabled_payments: ["qris"],
  };

  try {
    const transaction =
      await snap.createTransaction(parameter);

    if (
      !transaction ||
      !transaction.token ||
      !transaction.redirect_url
    ) {
      throw new Error(
        "Response Midtrans tidak valid."
      );
    }

    return {
      snapToken: transaction.token,
      paymentUrl: transaction.redirect_url,
    };
  } catch (error) {
    console.error(
      "Midtrans createTransaction Error:"
    );
    console.error(error);

    throw new AppError(
      "Gagal membuat transaksi pembayaran.",
    );
  }
};

module.exports = {
  createPayment,
};