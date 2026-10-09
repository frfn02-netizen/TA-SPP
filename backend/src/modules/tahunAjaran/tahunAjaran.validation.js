const { z } = require("zod");

const createSchema = z.object({
    nama: z
        .string({
            required_error: "Tahun ajaran wajib diisi",
        })
        .trim()
        .min(4, "Tahun ajaran minimal 4 karakter")
        .max(20, "Tahun ajaran maksimal 20 karakter"),

    semester: z.enum(
        ["GANJIL", "GENAP"],
        {
            message: "Semester harus GANJIL atau GENAP",
        }
    ),

    aktif: z
        .boolean()
        .optional()
        .default(false),
});

module.exports = {
    createSchema,
};