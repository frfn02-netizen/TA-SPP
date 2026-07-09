const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/auth.middleware");

const authController = require("./auth.controller");

router.post("/register", authController.register);
router.post("/login", authController.login);

router.get("/me", authMiddleware, (req, res) => {
    res.json({
        success: true,
        user: req.user
    })
})

module.exports = router;