# API Documentation

Semua endpoint memakai prefix `/api`.

## Authentication

- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/auth/me`

---

## Kelas (ADMIN)

- GET `/api/kelas`
- GET `/api/kelas/:id`
- POST `/api/kelas`
- PUT `/api/kelas/:id`
- DELETE `/api/kelas/:id`

---

## Siswa (ADMIN)

- GET `/api/siswa`
- GET `/api/siswa/:id`
- POST `/api/siswa`
- PUT `/api/siswa/:id`
- DELETE `/api/siswa/:id`

---

## Tahun Ajaran (ADMIN)

- GET `/api/tahun-ajaran`
- POST `/api/tahun-ajaran`
- PATCH `/api/tahun-ajaran/:id/activate`

---

## Tagihan

- GET `/api/tagihan` (ADMIN / SISWA, otomatis difilter)
- GET `/api/tagihan/:id` (ADMIN / SISWA)
- POST `/api/tagihan` (ADMIN)
- PUT `/api/tagihan/:id` (ADMIN)
- DELETE `/api/tagihan/:id` (ADMIN)

---

## Transaksi

- POST `/api/transaksi` (SISWA) - membuat Snap QRIS
- GET `/api/transaksi` (ADMIN / SISWA)
- GET `/api/transaksi/:id` (ADMIN / SISWA)

---

## Dashboard (ADMIN)

- GET `/api/dashboard`

---

## Webhook

- POST `/api/transaksi/webhook` (publik, diverifikasi via signature Midtrans)