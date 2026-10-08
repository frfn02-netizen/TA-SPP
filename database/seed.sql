USE spp_qris;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE transaksi;
TRUNCATE TABLE tagihan;
TRUNCATE TABLE siswa;
TRUNCATE TABLE tahun_ajaran;
TRUNCATE TABLE kelas;
TRUNCATE TABLE users;

SET FOREIGN_KEY_CHECKS = 1;

-- Password admin   : admin123
-- Password siswa   : sama dengan NISN (contoh 20260001)
INSERT INTO users (username, password, role) VALUES
('admin',    '$2b$10$yu0xrBvQUW5afqL5w8nfMecmaVoyg.kluw5.4ggteZXMHHM0LnAnG', 'ADMIN'),
('20260001', '$2b$10$HoNnUdhGQaiopOGmVVOHxeRrhc4oXkdbKzSFRVJkeWCoe3FeI/XxO', 'SISWA'),
('20260002', '$2b$10$YF35eDNLAqLOVrFkJNdaV.OeiXpA64/Xif.EPgK4PaegpUtpVVbnC', 'SISWA'),
('20260003', '$2b$10$CUJZ7jDzr6.AKlNd9c/IEOxkNC8h2hpL.kUUGgoFZ.M2TlPnY2DNe', 'SISWA');

INSERT INTO kelas (tingkat, jurusan) VALUES
('XII', 'RPL'),
('XII', 'TKJ'),
('XI',  'RPL');

INSERT INTO tahun_ajaran (nama, semester, aktif) VALUES
('2025/2026', 'GANJIL', TRUE);

INSERT INTO siswa (user_id, kelas_id, nisn, nama, jenis_kelamin, alamat, no_hp) VALUES
(2, 1, '20260001', 'Budi Santoso', 'L', 'Mojokerto', '081234567891'),
(3, 1, '20260002', 'Andi Pratama', 'L', 'Mojokerto', '081234567892'),
(4, 2, '20260003', 'Siti Rahma',   'P', 'Mojokerto', '081234567893');

INSERT INTO tagihan (siswa_id, tahun_ajaran_id, bulan, tahun, nominal, jatuh_tempo, status, keterangan) VALUES
(1, 1, 7, 2025, 250000, '2025-07-10', 'BELUM_LUNAS', 'SPP Juli'),
(1, 1, 8, 2025, 250000, '2025-08-10', 'BELUM_LUNAS', 'SPP Agustus'),
(2, 1, 7, 2025, 250000, '2025-07-10', 'LUNAS',       'SPP Juli'),
(3, 1, 7, 2025, 250000, '2025-07-10', 'BELUM_LUNAS', 'SPP Juli');

INSERT INTO transaksi (
    tagihan_id,
    order_id,
    gross_amount,
    transaction_status,
    payment_type,
    transaction_time,
    settlement_time,
    paid_at
) VALUES
(
    3,
    'SPP-20250710-SEED01',
    250000,
    'SETTLEMENT',
    'qris',
    '2025-07-05 08:00:00',
    '2025-07-05 08:00:05',
    '2025-07-05 08:00:05'
);
