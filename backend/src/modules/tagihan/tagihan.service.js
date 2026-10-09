const db = require("../../config/database");

const tagihanQuery = require("./tagihan.query");

const AppError = require("../../utils/app-error");

const getAll = async (user) => {

    if (user.role === "ADMIN") {
        return await tagihanQuery.getAll();
    }

    return await tagihanQuery.getByUserId(user.id);

};

const getById = async (
    id,
    user
) => {

    let tagihan;

    if (user.role === "ADMIN") {

        tagihan =
            await tagihanQuery.getById(id);

    } else {

        tagihan =
            await tagihanQuery.getByIdAndUserId(
                id,
                user.id
            );
    }

    if (!tagihan) {
        throw new AppError(
            "Tagihan tidak ditemukan",
            404
        );
    }

    return tagihan;

};
const create = async (data) => {

    if (!(await tagihanQuery.siswaExists(data.siswaId))) {
        throw new AppError("Siswa tidak ditemukan", 404);
    }

    if (!(await tagihanQuery.tahunAjaranExists(data.tahunAjaranId))) {
        throw new AppError("Tahun ajaran tidak ditemukan", 404);
    }

    const duplicate = await tagihanQuery.findDuplicate(
        data.siswaId,
        data.tahunAjaranId,
        data.bulan,
        data.tahun
    );

    if (duplicate) {
        throw new AppError(
            "Tagihan bulan tersebut sudah ada",
            409
        );
    }

    const conn = await db.getConnection();

    try {

        await conn.beginTransaction();

        const id = await tagihanQuery.create(
            conn,
            data
        );

        await conn.commit();

        return await tagihanQuery.getById(id);

    } catch (err) {

        await conn.rollback();
        throw err;

    } finally {

        conn.release();

    }

};

const update = async (id, data) => {

    const tagihan = await tagihanQuery.getById(id);

    if (!tagihan) {
        throw new AppError(
            "Tagihan tidak ditemukan",
            404
        );
    }

    if (!(await tagihanQuery.siswaExists(data.siswaId))) {
        throw new AppError(
            "Siswa tidak ditemukan",
            404
        );
    }

    if (!(await tagihanQuery.tahunAjaranExists(data.tahunAjaranId))) {
        throw new AppError(
            "Tahun ajaran tidak ditemukan",
            404
        );
    }

    const duplicate =
        await tagihanQuery.findDuplicate(
            data.siswaId,
            data.tahunAjaranId,
            data.bulan,
            data.tahun
        );

    if (duplicate && duplicate.id !== Number(id)) {
        throw new AppError(
            "Tagihan bulan tersebut sudah ada",
            409
        );
    }

    const conn = await db.getConnection();

    try {

        await conn.beginTransaction();

        await tagihanQuery.update(
            conn,
            id,
            data
        );

        await conn.commit();

        return await tagihanQuery.getById(id);

    } catch (err) {

        await conn.rollback();

        throw err;

    } finally {

        conn.release();

    }

};

const remove = async (id) => {

    const tagihan = await tagihanQuery.getById(id);

    if (!tagihan) {
        throw new AppError(
            "Tagihan tidak ditemukan",
            404
        );
    }

    const conn = await db.getConnection();

    try {

        await conn.beginTransaction();

        await tagihanQuery.remove(
            conn,
            id
        );

        await conn.commit();

    } catch (err) {

        await conn.rollback();

        throw err;

    } finally {

        conn.release();

    }

};

const toRupiah = (nominal, count) => {
    const cents = Math.round(Number(nominal) * 100);
    return (cents * count) / 100;
};

const bulkPreview = async (data) => {

    const {
        tahunAjaranId,
        bulan,
        tahun,
        nominal,
        kelasId,
    } = data;

    const tahunAjaran =
        await tagihanQuery.getTahunAjaranById(
            tahunAjaranId
        );

    if (!tahunAjaran) {
        throw new AppError(
            "Tahun ajaran tidak ditemukan",
            404
        );
    }

    if (
        kelasId &&
        !(await tagihanQuery.kelasExists(kelasId))
    ) {
        throw new AppError(
            "Kelas tidak ditemukan",
            404
        );
    }

    const targets =
        await tagihanQuery.getTargetSiswa(
            kelasId ?? null
        );

    const existingIds = new Set(
        (
            await tagihanQuery.getSiswaIdsByPeriod(
                tahunAjaranId,
                bulan,
                tahun
            )
        ).map(Number)
    );

    const willCreate = targets.filter(
        (target) => !existingIds.has(Number(target.id))
    ).length;

    const skipped = targets.length - willCreate;

    return {
        periode: { bulan, tahun },
        tahunAjaran: {
            id: tahunAjaran.id,
            nama: tahunAjaran.nama,
            semester: tahunAjaran.semester,
        },
        target: {
            scope: kelasId ? "KELAS" : "ALL",
            kelasId: kelasId ?? null,
        },
        nominal: Number(nominal),
        totalTarget: targets.length,
        willCreate,
        skipped,
        totalNominal: toRupiah(nominal, willCreate),
    };

};

const bulkGenerate = async (data) => {

    const {
        tahunAjaranId,
        bulan,
        tahun,
        nominal,
        jatuhTempo,
        keterangan,
        kelasId,
    } = data;

    const tahunAjaran =
        await tagihanQuery.getTahunAjaranById(
            tahunAjaranId
        );

    if (!tahunAjaran) {
        throw new AppError(
            "Tahun ajaran tidak ditemukan",
            404
        );
    }

    if (
        kelasId &&
        !(await tagihanQuery.kelasExists(kelasId))
    ) {
        throw new AppError(
            "Kelas tidak ditemukan",
            404
        );
    }

    // Hitung ulang target dan duplikasi dari database
    // pada saat generate, bukan mengandalkan preview.
    const targets =
        await tagihanQuery.getTargetSiswa(
            kelasId ?? null
        );

    const existingIds = new Set(
        (
            await tagihanQuery.getSiswaIdsByPeriod(
                tahunAjaranId,
                bulan,
                tahun
            )
        ).map(Number)
    );

    const newTargets = targets.filter(
        (target) => !existingIds.has(Number(target.id))
    );

    const preSkipped =
        targets.length - newTargets.length;

    const conn = await db.getConnection();

    let created = 0;
    let raceSkipped = 0;

    try {

        await conn.beginTransaction();

        for (const target of newTargets) {

            try {

                await tagihanQuery.create(
                    conn,
                    {
                        siswaId: target.id,
                        tahunAjaranId,
                        bulan,
                        tahun,
                        nominal,
                        jatuhTempo,
                        keterangan,
                    }
                );

                created += 1;

            } catch (err) {

                // Duplikasi dari request bersamaan:
                // lewati baris ini, jangan gagalkan seluruh batch.
                if (err && err.code === "ER_DUP_ENTRY") {
                    raceSkipped += 1;
                    continue;
                }

                throw err;
            }
        }

        await conn.commit();

    } catch (err) {

        await conn.rollback();
        throw err;

    } finally {

        conn.release();

    }

    return {
        periode: { bulan, tahun },
        tahunAjaran: {
            id: tahunAjaran.id,
            nama: tahunAjaran.nama,
            semester: tahunAjaran.semester,
        },
        target: {
            scope: kelasId ? "KELAS" : "ALL",
            kelasId: kelasId ?? null,
        },
        nominal: Number(nominal),
        totalTarget: targets.length,
        created,
        skipped: preSkipped + raceSkipped,
        failed: 0,
        totalNominal: toRupiah(nominal, created),
    };

};

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove,
    bulkPreview,
    bulkGenerate,
};