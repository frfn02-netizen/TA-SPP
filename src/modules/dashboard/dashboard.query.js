const db = require("../../config/database");

const getStats = async () => {
    const [rows] = await db.execute(`
        SELECT
            (SELECT COUNT(*) FROM siswa) AS total_siswa,
            (SELECT COUNT(*) FROM tagihan) AS total_tagihan,
            (SELECT COUNT(*) FROM tagihan WHERE status = 'LUNAS') AS total_lunas,
            (SELECT COUNT(*) FROM tagihan WHERE status = 'BELUM_LUNAS') AS total_belum_lunas,
            (SELECT COUNT(*) FROM transaksi) AS total_transaksi,
            (SELECT COALESCE(SUM(gross_amount), 0) FROM transaksi WHERE transaction_status = 'SETTLEMENT') AS total_pendapatan
    `);

    const row = rows[0];

    return {
        totalSiswa: Number(row.total_siswa),
        totalTagihan: Number(row.total_tagihan),
        totalLunas: Number(row.total_lunas),
        totalBelumLunas: Number(row.total_belum_lunas),
        totalTransaksi: Number(row.total_transaksi),
        totalPendapatan: Number(row.total_pendapatan),
    };
};

module.exports = {
    getStats,
};
