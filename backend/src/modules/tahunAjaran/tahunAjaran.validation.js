const { z } = require("zod");

const createSchema = z.object({
    nama: z
        .string({
            required_error: "Nama tahun ajaran wajib diisi",
        })
        .trim()
        .min(4, "Nama minimal 4 karakter")
        .max(20, "Nama maksimal 20 karakter"),

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