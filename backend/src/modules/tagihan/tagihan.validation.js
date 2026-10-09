const { z } = require("zod");

const schema = z.object({
    siswaId: z
        .coerce
        .number()
        .int()
        .positive(),

    tahunAjaranId: z
        .coerce
        .number()
        .int()
        .positive(),

    bulan: z
        .coerce
        .number()
        .int()
        .min(1)
        .max(12),

    tahun: z
        .coerce
        .number()
        .int()
        .min(2000)
        .max(2100),

    nominal: z
        .coerce
        .number()
        .positive(),

    jatuhTempo: z
        .string()
        .regex(
            /^\d{4}-\d{2}-\d{2}$/,
            "Format tanggal harus YYYY-MM-DD"
        ),

    keterangan: z
        .string()
        .trim()
        .max(255)
        .optional(),
});

const nullableKelasId = z.preprocess(
    (value) =>
        value === "" || value === null || value === undefined
            ? undefined
            : value,
    z.coerce
        .number()
        .int()
        .positive()
        .optional()
);

const bulkPreviewSchema = z.object({
    tahunAjaranId: z.coerce
        .number()
        .int()
        .positive(),

    bulan: z.coerce
        .number()
        .int()
        .min(1)
        .max(12),

    tahun: z.coerce
        .number()
        .int()
        .min(2000)
        .max(2100),

    nominal: z.coerce
        .number()
        .positive(),

    kelasId: nullableKelasId,
});

const bulkGenerateSchema = z.object({
    tahunAjaranId: z.coerce
        .number()
        .int()
        .positive(),

    bulan: z.coerce
        .number()
        .int()
        .min(1)
        .max(12),

    tahun: z.coerce
        .number()
        .int()
        .min(2000)
        .max(2100),

    nominal: z.coerce
        .number()
        .positive(),

    jatuhTempo: z
        .string()
        .regex(
            /^\d{4}-\d{2}-\d{2}$/,
            "Format tanggal harus YYYY-MM-DD"
        ),

    keterangan: z
        .string()
        .trim()
        .max(255)
        .optional(),

    kelasId: nullableKelasId,
});

module.exports = {
    createTagihanSchema: schema,
    updateTagihanSchema: schema,
    bulkPreviewSchema,
    bulkGenerateSchema,
};