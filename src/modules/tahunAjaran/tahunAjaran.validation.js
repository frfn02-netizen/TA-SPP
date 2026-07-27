const { z } = require("zod");

const createSchema = z.object({
    nama: z.string().trim().min(3).max(20),
    aktif: z.boolean().optional().default(false),
});

module.exports = { createSchema };
