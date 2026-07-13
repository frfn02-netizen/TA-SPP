const router = require("express").Router();
const authMiddleware = require("../../middlewares/auth.middleware");
const validate = require("../../middlewares/validate.middleware");
const authController = require("./auth.controller");
const { registerSchema, loginSchema } = require("./auth.validation");

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.get("/me", authMiddleware, (req, res) => res.json({ success: true, data: req.user }));

module.exports = router;
