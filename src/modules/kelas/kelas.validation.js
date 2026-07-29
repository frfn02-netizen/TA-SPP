const { z } = require("zod");

const schema = z.object({
    tingkat: z.enum(["X", "XI", "XII"]),

    jurusan: z
        .string()
        .trim()
        .min(2)
        .max(50),

    rombel: z
        .string()
        .trim()
        .min(1)
        .max(10),
});

module.exports = {
    createSchema: schema,
    updateSchema: schema,
};