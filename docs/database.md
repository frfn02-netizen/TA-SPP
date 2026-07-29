# Database Documentation

## Overview

Database digunakan untuk menyimpan seluruh data aplikasi pembayaran SPP berbasis QRIS.

---

# Entity Relationship

users
│
└── siswa
      │
      ├── kelas
      │
      └── tagihan
              │
              └── transaksi

---

# Tabel

## users

Menyimpan data akun yang dapat login ke sistem.

Kolom:

- id
- username
- password
- role
- is_active
- last_login
- created_at
- updated_at

Role:

- ADMIN
- SISWA

---

## kelas

Menyimpan data kelas.

Kolom:

- id
- tingkat
- jurusan
- rombel
- created_at
- updated_at

---

## siswa

Menyimpan identitas siswa.

Relasi:

- belongsTo users
- belongsTo kelas

Kolom:

- id
- user_id
- kelas_id
- nis
- nisn
- nama
- jenis_kelamin
- alamat
- no_hp
- created_at
- updated_at

---

## tahun_ajaran

Menyimpan data tahun ajaran.

Kolom:

- id
- nama
- semester
- aktif
- created_at
- updated_at

---

## tagihan

Menyimpan tagihan SPP siswa.

Relasi:

- belongsTo siswa
- belongsTo tahun_ajaran

Kolom:

- id
- siswa_id
- tahun_ajaran_id
- bulan
- tahun
- nominal
- jatuh_tempo
- status
- keterangan
- created_at
- updated_at

Status:

- BELUM_LUNAS
- LUNAS

---

## transaksi

Menyimpan transaksi pembayaran.

Relasi:

- belongsTo tagihan

Kolom:

- id
- tagihan_id
- order_id
- gross_amount
- transaction_status
- payment_type
- snap_token
- payment_url
- transaction_time
- settlement_time
- paid_at
- midtrans_response
- created_at
- updated_at