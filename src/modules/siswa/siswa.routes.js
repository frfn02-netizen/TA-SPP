const router = require("express").Router();
const siswaController = require("./siswa.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");

router.get(
    "/", authMiddleware, roleMiddleware("ADMIN"),
    siswaController.getAll
)

router.get("/:id", authMiddleware, roleMiddleware("ADMIN"),
    siswaController.getById
)

module.exports = router;