const db = require("../../config/database");
const webhookService = require ("../../services/payment/webhook.service")
const transaksiQuery = require("./transaksi.query");
const tagihanQuery = require("../tagihan/tagihan.query");
const { createTransaksiSchema } = require ("./transaksi.validator")
const paymentService = require("../../services/payment/payment.service");
const mapStatus = require("../../services/payment/payment-status.helper");
const generateOrderId = require("../../utils/generate-order-id");
const AppError = require("../../utils/app-error");

/*
|--------------------------------------------------------------------------
| CREATE TRANSAKSI
|--------------------------------------------------------------------------
*/
const create = async (
    data,
    user
) => {

    const payload =
        createTransaksiSchema.parse(data);

    const { tagihanId } = payload;

    const tagihan = await tagihanQuery.getById(tagihanId);

    if (!tagihan) {
        throw new AppError(
            "Tagihan tidak ditemukan",
            404
        );
    }

    // Siswa hanya boleh membayar tagihan miliknya
    if (
        user.role !== "ADMIN" &&
        tagihan.user_id !== user.id
    ) {
        throw new AppError(
            "Anda tidak memiliki akses ke tagihan ini",
            403
        );
    }

    if (tagihan.status === "LUNAS") {
        throw new AppError(
            "Tagihan sudah lunas",
            400
        );
    }

    const existing =
        await transaksiQuery.findByTagihanId(
            tagihanId
        );

    // Transaksi PENDING yang masih berlaku dipakai ulang.
    if (existing && existing.transaction_status === "PENDING") {
        return {
            id: existing.id,
            orderId: existing.order_id,
            transactionStatus:
                existing.transaction_status,
            snapToken:
                existing.snap_token,
            paymentUrl:
                existing.payment_url,
        };
    }

    const orderId =
        generateOrderId();

    const payment =
        await paymentService.createPayment({
            orderId,
            grossAmount: Number(tagihan.nominal),
            customer: {
                nama: tagihan.nama,
            },
        });

    const conn =
        await db.getConnection();

    try {

        await conn.beginTransaction();

        // Tagihan sudah pernah punya transaksi (EXPIRE/CANCEL).
        // Baris transaksi bersifat unik per tagihan, jadi dipakai ulang.
        if (existing) {

            await transaksiQuery.updatePayment(
                conn,
                {
                    id: existing.id,
                    orderId,
                    grossAmount:
                        tagihan.nominal,
                    snapToken:
                        payment.snapToken,
                    paymentUrl:
                        payment.paymentUrl,
                }
            );

            await conn.commit();

            return {
                id: existing.id,
                orderId,
                transactionStatus:
                    "PENDING",
                snapToken:
                    payment.snapToken,
                paymentUrl:
                    payment.paymentUrl,
            };
        }

        const transaksiId =
            await transaksiQuery.create(
                conn,
                {
                    tagihanId,
                    orderId,
                    grossAmount:
                        tagihan.nominal,
                    snapToken:
                        payment.snapToken,
                    paymentUrl:
                        payment.paymentUrl,
                    transactionStatus:
                        "PENDING",
                }
            );

        await conn.commit();

        return {
            id: transaksiId,
            orderId,
            transactionStatus:
                "PENDING",
            snapToken:
                payment.snapToken,
            paymentUrl:
                payment.paymentUrl,
        };

    } catch (err) {

        await conn.rollback();
        throw err;

    } finally {

        conn.release();

    }

};

/*
|--------------------------------------------------------------------------
| GET ALL
|--------------------------------------------------------------------------
*/

const getAll = async (
    user
) => {

    if (
        user.role === "ADMIN"
    ) {
        return await transaksiQuery.findAll();
    }

    return await transaksiQuery.findByUserId(
        user.id
    );

};

/*
|--------------------------------------------------------------------------
| GET BY ID
|--------------------------------------------------------------------------
*/

const getById = async (
    id,
    user
) => {

    let transaksi;

    if (
        user.role === "ADMIN"
    ) {

        transaksi =
            await transaksiQuery.findById(
                id
            );

    } else {

        transaksi =
            await transaksiQuery.findByIdAndUserId(
                id,
                user.id
            );

    }

    if (!transaksi) {
        throw new AppError(
            "Transaksi tidak ditemukan",
            404
        );
    }

    return transaksi;

};
/*
|--------------------------------------------------------------------------
| HANDLE WEBHOOK
|--------------------------------------------------------------------------
*/

const handleWebhook = async (
    notification
) => {

    const status =
        await webhookService.handle(
          notification
        )

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

    const conn =
        await db.getConnection();

    try {

        await conn.beginTransaction();

        const transactionStatus =
            mapStatus(
                status.transaction_status,
                status.fraud_status
            );

        await transaksiQuery.updateStatus(
            conn,
            {
                orderId:
                    status.order_id,
                transactionStatus,
                paymentType:
                    status.payment_type,
                transactionTime:
                    status.transaction_time,
                settlementTime:
                    status.settlement_time,
                paidAt:
                    transactionStatus === "SETTLEMENT"
                        ? new Date()
                        : null,
                midtransResponse:
                    status,
            }
        );

        // Sinkronkan status tagihan
        if (
            transactionStatus === "SETTLEMENT"
        ) {

            await tagihanQuery.updateStatus(
                conn,
                transaksi.tagihan_id,
                "LUNAS"
            );

        }

        await conn.commit();

        return {
            orderId:
                status.order_id,
            transactionStatus,
        };

    } catch (err) {

        await conn.rollback();
        throw err;

    } finally {

        conn.release();

    }

};

/*
|--------------------------------------------------------------------------
| EXPORTS
|--------------------------------------------------------------------------
*/

module.exports = {
    create,
    getAll,
    getById,
    handleWebhook,
};