const { z } = require("zod");

const createTagihanSchema = z.object({
  siswaId: z.coerce.number().int().positive(),
  tahunAjaranId: z.coerce.number().int().positive(),
  bulan: z.coerce.number().int().min(1).max(12),
  tahun: z.coerce.number().int().min(2000).max(2100),
  nominal: z.coerce.number().positive(),
  jatuhTempo: z.string().date(),
  keterangan: z.string().trim().max(255).optional(),
});

module.exports = { createTagihanSchema };
