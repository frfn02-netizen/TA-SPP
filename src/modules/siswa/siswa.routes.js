const router = require("express").Router();
const siswaController = require("./siswa.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");
const validate = require("../../middlewares/validate.middleware");
const { createSiswaSchema } = require("./siswa.validation");

router.use(authMiddleware, roleMiddleware("ADMIN"));
router.get("/", siswaController.getAll);
router.get("/:id", siswaController.getById);
router.post("/", validate(createSiswaSchema), siswaController.create);

module.exports = router;
