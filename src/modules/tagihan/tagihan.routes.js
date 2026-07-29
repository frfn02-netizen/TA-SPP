const router = require("express").Router();

const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");
const validate = require("../../middlewares/validate.middleware");

const tagihanController = require("./tagihan.controller");

const {
    createTagihanSchema,
    updateTagihanSchema,
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