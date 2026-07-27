const snap = require("./midtrans.service");

const createPayment = async ({
  orderId,
  grossAmount,
  customer,
}) => {
  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: grossAmount,
    },

    customer_details: {
      first_name: customer.nama,
      email: customer.email,
    },

    enabled_payments: ["qris"],
  };

  const transaction =
    await snap.createTransaction(parameter);

  return {
    snapToken: transaction.token,
    paymentUrl: transaction.redirect_url,
  };
};

module.exports = {
  createPayment,
};