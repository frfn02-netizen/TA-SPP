const { verifySignature } = require("./signature.service");
const AppError = require("../../utils/app-error");

const handle = async (payload) => {
  const valid = verifySignature({
    orderId: payload.order_id,
    statusCode: payload.status_code,
    grossAmount: payload.gross_amount,
    signatureKey: payload.signature_key,
  });

  if (!valid) {
    throw new AppError("Signature Midtrans tidak valid.", 401);
  }

  return {
    order_id: payload.order_id,
    transaction_status: payload.transaction_status,
    fraud_status: payload.fraud_status,
    payment_type: payload.payment_type,
    transaction_time: payload.transaction_time,
    settlement_time: payload.settlement_time,
    status_code: payload.status_code,
    gross_amount: payload.gross_amount,
  };
};

module.exports = {
  handle,
};
