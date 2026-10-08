require("dotenv").config();

const { test } = require("node:test");
const assert = require("node:assert");
const { z } = require("zod");

const mapStatus = require("../src/services/payment/payment-status.helper");
const generateOrderId = require("../src/utils/generate-order-id");
const { verifySignature } = require("../src/services/payment/signature.service");
const validate = require("../src/middlewares/validate.middleware");

test("mapStatus hanya menghasilkan nilai yang valid untuk ENUM transaksi", () => {
    const allowed = ["PENDING", "SETTLEMENT", "EXPIRE", "CANCEL"];
    const inputs = [
        "capture",
        "settlement",
        "pending",
        "deny",
        "cancel",
        "expire",
        "refund",
        "partial_refund",
        "chargeback",
        "unknown",
    ];

    for (const input of inputs) {
        assert.ok(
            allowed.includes(mapStatus(input)),
            `${input} menghasilkan status tidak valid: ${mapStatus(input)}`
        );
    }

    assert.equal(mapStatus("settlement"), "SETTLEMENT");
    assert.equal(mapStatus("capture", "accept"), "SETTLEMENT");
    assert.equal(mapStatus("capture", "challenge"), "PENDING");
    assert.equal(mapStatus("expire"), "EXPIRE");
    assert.equal(mapStatus("deny"), "CANCEL");
});

test("generateOrderId menghasilkan format SPP-YYYYMMDD-XXXXXX", () => {
    const orderId = generateOrderId();
    assert.match(orderId, /^SPP-\d{8}-[0-9A-F]{6}$/);
});

test("verifySignature menerima signature yang benar dan menolak yang salah", () => {
    const crypto = require("crypto");
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const orderId = "SPP-TEST-0001";
    const statusCode = "200";
    const grossAmount = "250000.00";

    const signatureKey = crypto
        .createHash("sha512")
        .update(orderId + statusCode + grossAmount + serverKey)
        .digest("hex");

    assert.equal(
        verifySignature({ orderId, statusCode, grossAmount, signatureKey }),
        true
    );
    assert.equal(
        verifySignature({
            orderId,
            statusCode,
            grossAmount,
            signatureKey: "deadbeef",
        }),
        false
    );
});

test("validate middleware mengembalikan detail issue Zod 4", () => {
    const middleware = validate(z.object({ a: z.number() }));

    let statusCode;
    let payload;
    const res = {
        status(code) {
            statusCode = code;
            return this;
        },
        json(body) {
            payload = body;
            return this;
        },
    };

    middleware({ body: {} }, res, () => {
        throw new Error("next() seharusnya tidak dipanggil");
    });

    assert.equal(statusCode, 400);
    assert.equal(payload.message, "Validasi gagal");
    assert.ok(Array.isArray(payload.errors));
    assert.ok(payload.errors.length > 0);
});
