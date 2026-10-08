const { z } = require("zod");

const schema = z.object({
    tingkat: z
        .string()
        .transform((val) => val.toUpperCase())
        .pipe(z.enum(["X", "XI", "XII"])),

    jurusan: z
        .string()
        .trim()
        .min(2)
        .max(50),
});

module.exports = {
    createSchema: schema,
    updateSchema: schema,
};
