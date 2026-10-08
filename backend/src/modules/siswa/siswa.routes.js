const router = require("express").Router();
const siswaController = require("./siswa.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");
const validate = require("../../middlewares/validate.middleware");
const { createSiswaSchema, updateSiswaSchema,} = require("./siswa.validation");

router.use( authMiddleware, roleMiddleware("ADMIN"));
router.get("/", siswaController.getAll);
router.get("/:id", siswaController.getById);
router.post("/", validate(createSiswaSchema), siswaController.create);
router.put("/:id",validate(updateSiswaSchema),siswaController.update);
router.delete("/:id",siswaController.remove);
module.exports = router;