const midtransclient = require ("midtrans-client")

const snap = new midtransclient.Snap({
    isProduction:
    process.env.MIDTRANS_IS_PRODUCTION === "true",

    serverKey: process.env.MIDTRANS_SERVER_PRODUCTION,
    
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
})
module.exports = snap;