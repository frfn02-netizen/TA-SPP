const router = require("express").Router();

const kelasController = require("./kelas.controller");

const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");
const validate = require("../../middlewares/validate.middleware");

const {
    createSchema,
    updateSchema,
} = require("./kelas.validation");

// ==========================
// GET ALL KELAS
// ==========================
router.get(
    "/",
    authMiddleware,
    roleMiddleware("ADMIN"),
    kelasController.getAll
);

// ==========================
// GET KELAS BY ID
// ==========================
router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("ADMIN"),
    kelasController.getById
);

// ==========================
// CREATE KELAS
// ==========================
router.post(
    "/",
    authMiddleware,
    roleMiddleware("ADMIN"),
    validate(createSchema),
    kelasController.create
);

// ==========================
// UPDATE KELAS
// ==========================
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("ADMIN"),
    validate(updateSchema),
    kelasController.update
);

// ==========================
// DELETE KELAS
// ==========================
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("ADMIN"),
    kelasController.remove
);

module.exports = router;