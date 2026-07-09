CREATE DATABASE IF NOT EXISTS spp_qris;
USE spp_qris;

-- ==========================
-- USERS
-- ==========================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,

    username VARCHAR(50) UNIQUE NOT NULL,

    password VARCHAR(255) NOT NULL,

    role ENUM('ADMIN','SISWA') NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

-- ==========================
-- SISWA
-- ==========================
CREATE TABLE siswa (

    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT UNIQUE NOT NULL,

    nisn VARCHAR(20) UNIQUE NOT NULL,

    nama VARCHAR(100) NOT NULL,

    kelas VARCHAR(20) NOT NULL,

    no_telp_ortu VARCHAR(20),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- ==========================
-- TAGIHAN
-- ==========================
CREATE TABLE tagihan (

    id INT AUTO_INCREMENT PRIMARY KEY,

    siswa_id INT NOT NULL,

    bulan TINYINT NOT NULL,

    tahun YEAR NOT NULL,

    nominal DECIMAL(10,2) NOT NULL,

    status ENUM(
        'BELUM_BAYAR',
        'PROSES',
        'LUNAS'
    ) DEFAULT 'BELUM_BAYAR',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (siswa_id)
        REFERENCES siswa(id)
        ON DELETE CASCADE
);

-- ==========================
-- TRANSAKSI
-- ==========================
CREATE TABLE transaksi (

    id INT AUTO_INCREMENT PRIMARY KEY,

    tagihan_id INT NOT NULL,

    order_id VARCHAR(100) UNIQUE NOT NULL,

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

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY(tagihan_id)
        REFERENCES tagihan(id)
        ON DELETE CASCADE
);