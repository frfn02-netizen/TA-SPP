const express = require("express");

const router = express.Router();

const controller = require("./transaksi.controller");

const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");

/*
|--------------------------------------------------------------------------
| WEBHOOK MIDTRANS
|--------------------------------------------------------------------------
| Tidak memakai JWT karena dipanggil oleh server Midtrans.
*/

router.post(
    "/webhook",
    controller.webhook
);

/*
|--------------------------------------------------------------------------
| Semua endpoint di bawah wajib login
|--------------------------------------------------------------------------
*/

router.use(authMiddleware);

/*
|--------------------------------------------------------------------------
| SISWA
|--------------------------------------------------------------------------
*/

router.post(
    "/",
    roleMiddleware("SISWA"),
    controller.create
);

/*
|--------------------------------------------------------------------------
| ADMIN & SISWA
|--------------------------------------------------------------------------
*/

router.get(
    "/",
    controller.getAll
);

router.get(
    "/:id",
    controller.getById
);

module.exports = router;