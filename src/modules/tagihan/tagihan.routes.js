const router = require("express").Router();
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");
const validate = require("../../middlewares/validate.middleware");
const tagihanController = require("./tagihan.controller");
const { createTagihanSchema } = require("./tagihan.validation");

router.use(authMiddleware);
router.get("/", tagihanController.getAll);
router.post("/", roleMiddleware("ADMIN"), validate(createTagihanSchema), tagihanController.create);

module.exports = router;
