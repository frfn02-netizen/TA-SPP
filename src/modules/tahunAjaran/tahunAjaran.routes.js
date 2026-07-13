const router = require("express").Router();

const controller = require("./tahunAjaran.controller");

const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");

router.get(
    "/",
    authMiddleware,
    roleMiddleware("ADMIN"),
    controller.getAll
);

router.post(
    "/",
    authMiddleware,
    roleMiddleware("ADMIN"),
    controller.create
);

router.patch(
    "/:id/activate",
    authMiddleware,
    roleMiddleware("ADMIN"),
    controller.activate
)

module.exports = router;