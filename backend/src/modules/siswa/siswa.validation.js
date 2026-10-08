const { z } = require("zod");

const schema = z.object({
    kelasId: z
        .coerce
        .number({
            required_error: "Kelas wajib dipilih",
        })
        .int()
        .positive(),

    nisn: z
        .string({
            required_error: "NISN wajib diisi",
        })
        .trim()
        .regex(/^\d{10}$/, "NISN harus terdiri dari 10 digit angka"),

    nama: z
        .string({
            required_error: "Nama wajib diisi",
        })
        .trim()
        .min(2, "Nama minimal 2 karakter")
        .max(100, "Nama maksimal 100 karakter"),

    jenisKelamin: z.enum(
        ["L", "P"],
        {
            message: "Jenis kelamin harus L atau P",
        }
    ),

    alamat: z
        .string({
            required_error: "Alamat wajib diisi",
        })
        .trim()
        .min(5, "Alamat minimal 5 karakter")
        .max(255, "Alamat maksimal 255 karakter"),

    noHp: z
        .string({
            required_error: "Nomor HP wajib diisi",
        })
        .trim()
        .regex(
            /^(\+62|08)[0-9]{8,13}$/,
            "Nomor HP tidak valid"
        ),
});

module.exports = {
    createSiswaSchema: schema,
    updateSiswaSchema: schema,
};