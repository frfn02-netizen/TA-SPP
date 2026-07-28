const midtransClient = require("midtrans-client");

console.log("SERVER KEY:", process.env.MIDTRANS_SERVER_KEY);
console.log("CLIENT KEY:", process.env.MIDTRANS_CLIENT_KEY);

const snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

module.exports = snap;