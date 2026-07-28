const paymentService = require("./payment.service");
const { verifySignature } = require("./signature.service");

const handle = async (payload) => {
  const valid = verifySignature({
    orderId: payload.order_id,
    statusCode: payload.status_code,
    grossAmount: payload.gross_amount,
    signatureKey: payload.signature_key,
  });

  if (!valid) {
    throw new Error("Signature Midtrans tidak valid.");
  }

  const notification =
    await paymentService.handleNotification(payload);

  return notification;
};

module.exports = {
  handle,
};