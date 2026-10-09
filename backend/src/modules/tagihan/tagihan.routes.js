const router = require("express").Router();

const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");
const validate = require("../../middlewares/validate.middleware");

const tagihanController = require("./tagihan.controller");

const {
    createTagihanSchema,
    updateTagihanSchema,
    bulkGenerateSchema,
} = require("./tagihan.validation");

router.use(authMiddleware);

/*
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
*/

router.get(
    "/",
    tagihanController.getAll
);

/*
| Bulk preview harus terdaftar sebelum "/:id"
| agar tidak tertangkap sebagai parameter id.
*/
router.get(
    "/bulk-preview",
    roleMiddleware("ADMIN"),
    tagihanController.bulkPreview
);

router.get(
    "/:id",
    tagihanController.getById
);

/*
|--------------------------------------------------------------------------
| ADMIN ONLY
|--------------------------------------------------------------------------
*/

router.post(
    "/",
    roleMiddleware("ADMIN"),
    validate(createTagihanSchema),
    tagihanController.create
);

router.post(
    "/bulk-generate",
    roleMiddleware("ADMIN"),
    validate(bulkGenerateSchema),
    tagihanController.bulkGenerate
);

router.put(
    "/:id",
    roleMiddleware("ADMIN"),
    validate(updateTagihanSchema),
    tagihanController.update
);

router.delete(
    "/:id",
    roleMiddleware("ADMIN"),
    tagihanController.remove
);

module.exports = router;