const { z } = require("zod");

const createSiswaSchema = z.object({
  nisn: z.string().trim().regex(/^\d{6,20}$/, "NISN harus berupa 6–20 digit angka"),
  nama: z.string().trim().min(2).max(100),
  kelasId: z.coerce.number().int().positive(),
  noTelpOrtu: z.string().trim().regex(/^\+?[0-9]{8,20}$/, "Nomor telepon tidak valid").optional(),
});

module.exports = { createSiswaSchema };
