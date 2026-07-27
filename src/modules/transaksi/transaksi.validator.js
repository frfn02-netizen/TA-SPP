import { z } from "zod";

export const createTransaksiSchema = z.object({
    tagihanId: z.number({
        required_error: "Tagihan wajib dipilih",
        invalid_type_error: "Tagihan harus berupa angka",
    })
    .int("Tagihan harus berupa bilangan bulat")
    .positive("Tagihan tidak valid")
})