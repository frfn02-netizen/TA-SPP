DROP DATABASE IF EXISTS spp_qris;
CREATE DATABASE spp_qris;
USE spp_qris;

-- ==================================================
-- TAHUN AJARAN
-- ==================================================

CREATE TABLE tahun_ajaran (

    id INT AUTO_INCREMENT PRIMARY KEY,

    nama VARCHAR(20) NOT NULL UNIQUE,

    aktif BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

-- ==================================================
-- USERS
-- ==================================================

CREATE TABLE users (

    id INT AUTO_INCREMENT PRIMARY KEY,

    username VARCHAR(50) UNIQUE NOT NULL,

    password VARCHAR(255) NOT NULL,

    role ENUM(
        'ADMIN',
        'SISWA'
    ) NOT NULL,

    must_change_password BOOLEAN DEFAULT TRUE,

    is_active BOOLEAN DEFAULT TRUE,

    last_login DATETIME NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP

);

-- ==================================================
-- KELAS
-- ==================================================

CREATE TABLE kelas (

    id INT AUTO_INCREMENT PRIMARY KEY,

    tahun_ajaran_id INT NOT NULL,

    nama_kelas VARCHAR(30) NOT NULL,

    tingkat ENUM(
        'X',
        'XI',
        'XII'
    ) NOT NULL,

    jurusan VARCHAR(50) NOT NULL,

    wali_kelas VARCHAR(100),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (tahun_ajaran_id)
        REFERENCES tahun_ajaran(id),

    UNIQUE (tahun_ajaran_id, nama_kelas)

);

-- ==================================================
-- SISWA
-- ==================================================

CREATE TABLE siswa (

    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT UNIQUE NOT NULL,

    kelas_id INT NOT NULL,

    nisn VARCHAR(20) UNIQUE NOT NULL,

    nama VARCHAR(100) NOT NULL,

    no_telp_ortu VARCHAR(20),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY(user_id)
        REFERENCES users(id),

    FOREIGN KEY(kelas_id)
        REFERENCES kelas(id)

);

CREATE INDEX idx_nisn
ON siswa(nisn);

-- ==================================================
-- TAGIHAN
-- ==================================================

CREATE TABLE tagihan (

    id INT AUTO_INCREMENT PRIMARY KEY,

    siswa_id INT NOT NULL,

    tahun_ajaran_id INT NOT NULL,

    bulan TINYINT NOT NULL,

    tahun YEAR NOT NULL,

    nominal DECIMAL(10,2) NOT NULL,

    jatuh_tempo DATE NOT NULL,

    keterangan VARCHAR(255),

    status ENUM(

        'BELUM_BAYAR',

        'PROSES',

        'LUNAS'

    ) DEFAULT 'BELUM_BAYAR',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY(siswa_id)
        REFERENCES siswa(id),

    FOREIGN KEY(tahun_ajaran_id)
        REFERENCES tahun_ajaran(id),

    UNIQUE(
        siswa_id,
        bulan,
        tahun,
        tahun_ajaran_id
    )

);

CREATE INDEX idx_tagihan_status
ON tagihan(status);

CREATE INDEX idx_tagihan_bulan
ON tagihan(bulan);

-- ==================================================
-- TRANSAKSI
-- ==================================================

CREATE TABLE transaksi (

    id INT AUTO_INCREMENT PRIMARY KEY,

    tagihan_id INT NOT NULL,

    order_id VARCHAR(100) UNIQUE NOT NULL,

    snap_token VARCHAR(255),

    payment_url TEXT,

    gross_amount DECIMAL(10,2) NOT NULL,

    payment_type VARCHAR(50),

    transaction_status ENUM(

        'PENDING',

        'SETTLEMENT',

        'EXPIRE',

        'CANCEL'

    ) DEFAULT 'PENDING',

    transaction_time DATETIME,

    settlement_time DATETIME,

    paid_at DATETIME,

    midtrans_response JSON,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY(tagihan_id)
        REFERENCES tagihan(id)

);

CREATE INDEX idx_order
ON transaksi(order_id);

CREATE INDEX idx_status
ON transaksi(transaction_status);
