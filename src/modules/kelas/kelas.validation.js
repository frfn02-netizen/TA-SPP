const { z } = require("zod");

const createSchema = z.object({
    tahunAjaranId: z
        .coerce.number({
            required_error: "Tahun ajaran wajib diisi",
        })
        .int()
        .positive(),

    namaKelas: z
        .string({
            required_error: "Nama kelas wajib diisi",
        })
        .min(3, "Nama kelas minimal 3 karakter")
        .max(30, "Nama kelas maksimal 30 karakter"),

    tingkat: z.enum(
        ["X", "XI", "XII"],
        {
            message: "Tingkat harus X, XI, atau XII",
        }
    ),

    jurusan: z
        .string({
            required_error: "Jurusan wajib diisi",
        })
        .min(2, "Jurusan minimal 2 karakter")
        .max(50, "Jurusan maksimal 50 karakter"),

    waliKelas: z
        .string({
            required_error: "Wali kelas wajib diisi",
        })
        .min(3, "Wali kelas minimal 3 karakter")
        .max(100, "Wali kelas maksimal 100 karakter"),
});

const updateSchema = createSchema;

module.exports = {
    createSchema,
    updateSchema,
};
