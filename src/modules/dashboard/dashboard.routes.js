const router = require("express").Router();

const dashboardController = require("./dashboard.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");

router.get(
    "/",
    authMiddleware,
    roleMiddleware("ADMIN"),
    dashboardController.getStats
);

module.exports = router;
