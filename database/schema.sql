DROP TABLE IF EXISTS transaksi;
DROP TABLE IF EXISTS tagihan;
DROP TABLE IF EXISTS siswa;
DROP TABLE IF EXISTS tahun_ajaran;
DROP TABLE IF EXISTS kelas;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,

    username VARCHAR(50) NOT NULL UNIQUE,

    password VARCHAR(255) NOT NULL,

    role ENUM(
        'ADMIN',
        'SISWA'
    ) NOT NULL,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    last_login DATETIME NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE kelas (
    id INT AUTO_INCREMENT PRIMARY KEY,

    tingkat ENUM(
        'X',
        'XI',
        'XII'
    ) NOT NULL,

    jurusan VARCHAR(50) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_kelas (
        tingkat,
        jurusan
    )
);

CREATE TABLE siswa (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    kelas_id INT NOT NULL,

    nisn VARCHAR(20) NOT NULL UNIQUE,

    nama VARCHAR(150) NOT NULL,

    jenis_kelamin ENUM(
        'L',
        'P'
    ) NOT NULL,

    alamat TEXT NULL,

    no_hp VARCHAR(20) NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_siswa_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_siswa_kelas
        FOREIGN KEY (kelas_id)
        REFERENCES kelas(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE TABLE tahun_ajaran (
    id INT AUTO_INCREMENT PRIMARY KEY,

    nama VARCHAR(20) NOT NULL UNIQUE,

    semester ENUM(
        'GANJIL',
        'GENAP'
    ) NOT NULL,

    aktif BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE tagihan (
    id INT AUTO_INCREMENT PRIMARY KEY,

    siswa_id INT NOT NULL,

    tahun_ajaran_id INT NOT NULL,

    bulan TINYINT NOT NULL,

    tahun SMALLINT NOT NULL,

    nominal DECIMAL(12,2) NOT NULL,

    jatuh_tempo DATE NOT NULL,

    status ENUM(
        'BELUM_LUNAS',
        'LUNAS'
    ) NOT NULL DEFAULT 'BELUM_LUNAS',

    keterangan TEXT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_tagihan_siswa
        FOREIGN KEY (siswa_id)
        REFERENCES siswa(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_tagihan_tahun_ajaran
        FOREIGN KEY (tahun_ajaran_id)
        REFERENCES tahun_ajaran(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT chk_nominal
        CHECK (nominal > 0),

    CONSTRAINT chk_bulan
        CHECK (bulan BETWEEN 1 AND 12),

    UNIQUE KEY uk_tagihan_periode (
        siswa_id,
        tahun_ajaran_id,
        bulan,
        tahun
    ),

    INDEX idx_tagihan_status (status),

    INDEX idx_tagihan_siswa (siswa_id)
);

CREATE TABLE transaksi (
    id INT AUTO_INCREMENT PRIMARY KEY,

    tagihan_id INT NOT NULL,

    order_id VARCHAR(100) NOT NULL,

    gross_amount DECIMAL(12,2) NOT NULL,

    transaction_status ENUM(
        'PENDING',
        'SETTLEMENT',
        'EXPIRE',
        'CANCEL'
    ) NOT NULL DEFAULT 'PENDING',

    payment_type VARCHAR(50) NULL,

    snap_token TEXT NULL,

    payment_url TEXT NULL,

    transaction_time DATETIME NULL,

    settlement_time DATETIME NULL,

    paid_at DATETIME NULL,

    midtrans_response JSON NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_transaksi_tagihan
        FOREIGN KEY (tagihan_id)
        REFERENCES tagihan(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT chk_gross_amount
        CHECK (gross_amount > 0),

    UNIQUE KEY uk_order_id (order_id),

    UNIQUE KEY uk_transaksi_tagihan (tagihan_id),

    INDEX idx_status (transaction_status)
);
