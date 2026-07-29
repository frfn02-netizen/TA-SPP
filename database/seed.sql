USE spp_qris;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE transaksi;
TRUNCATE TABLE tagihan;
TRUNCATE TABLE siswa;
TRUNCATE TABLE tahun_ajaran;
TRUNCATE TABLE kelas;
TRUNCATE TABLE users;

SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO users (
    username,
    password,
    role
)
VALUES
(
    'admin',
    '$2b$10$XFT584YDAv6QtLVIRdj6eO8P1d5sqifwMrPOb30B3jMvv93sVtEO.',
    'ADMIN'
),
(
    '20260001',
    '$2b$10$XFT584YDAv6QtLVIRdj6eO8P1d5sqifwMrPOb30B3jMvv93sVtEO.',
    'SISWA'
),
(
    '20260002',
    '$2b$10$XFT584YDAv6QtLVIRdj6eO8P1d5sqifwMrPOb30B3jMvv93sVtEO.',
    'SISWA'
),
(
    '20260003',
    '$2b$10$XFT584YDAv6QtLVIRdj6eO8P1d5sqifwMrPOb30B3jMvv93sVtEO.',
    'SISWA'
);

INSERT INTO kelas (
    tingkat,
    jurusan,
    rombel
)
VALUES
('XII','RPL','1'),
('XII','RPL','2'),
('XII','TKJ','1');

INSERT INTO tahun_ajaran (
    nama,
    semester,
    aktif
)

VALUES
(
    '2026/2027',
    'GANJIL',
    TRUE
);

INSERT INTO siswa (
    user_id,
    kelas_id,
    nis,
    nisn,
    nama,
    jenis_kelamin,
    alamat,
    no_hp
)
VALUES
(
    2,
    1,
    '20260001',
    '357800000001',
    'Budi Santoso',
    'L',
    'Mojokerto',
    '081234567891'
),
(
    3,
    1,
    '20260002',
    '357800000002',
    'Andi Pratama',
    'L',
    'Mojokerto',
    '081234567892'
),
(
    4,
    2,
    '20260003',
    '357800000003',
    'Siti Rahma',
    'P',
    'Mojokerto',
    '081234567893'
);

INSERT INTO tagihan (
    siswa_id,
    tahun_ajaran_id,
    bulan,
    tahun,
    nominal,
    jatuh_tempo,
    status,
    keterangan
)
VALUES

(
    1,
    1,
    7,
    2026,
    250000,
    '2026-07-10',
    'BELUM_LUNAS',
    'SPP Juli'
),

(
    1,
    1,
    8,
    2026,
    250000,
    '2026-08-10',
    'BELUM_LUNAS',
    'SPP Agustus'
),

(
    2,
    1,
    7,
    2026,
    250000,
    '2026-07-10',
    'LUNAS',
    'SPP Juli'
),

(
    3,
    1,
    7,
    2026,
    250000,
    '2026-07-10',
    'BELUM_LUNAS',
    'SPP Juli'
);

