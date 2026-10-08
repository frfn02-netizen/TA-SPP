# System Flow

## Login

Admin / Siswa

↓

Input Username & Password

↓

Backend Authentication

↓

Generate JWT

↓

Login Success

---

## Kelola Tagihan

Admin

↓

Pilih Siswa

↓

Tambah Tagihan

↓

Database

↓

Tagihan Berhasil Dibuat

---

## Pembayaran

Admin / Siswa

↓

Pilih Tagihan

↓

POST /transaksi

↓

Generate Snap Token

↓

Midtrans Snap

↓

User Melakukan Pembayaran

↓

Midtrans Webhook

↓

Backend Verifikasi Signature

↓

Update transaksi

↓

Update tagihan

↓

Pembayaran Berhasil

---

## Dashboard

Admin Login

↓

Hitung Total Siswa

↓

Hitung Total Tagihan

↓

Hitung Tagihan Lunas

↓

Hitung Tagihan Belum Lunas

↓

Hitung Total Pendapatan

↓

Tampilkan Dashboard