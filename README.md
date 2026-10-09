# SPP QRIS

Sistem administrasi pembayaran SPP berbasis QRIS untuk SMK. Monorepo ini berisi
backend API dan frontend Angular dalam satu repository.

## Struktur

```
.
├── backend/     # REST API (Express + MySQL), integrasi Midtrans QRIS
├── frontend/    # Aplikasi Angular (admin + portal siswa)
├── .gitignore
└── README.md
```

## Backend

```
cd backend
npm install
npm run dev      # nodemon src/server.js
npm test         # node --test tests/
```

Konfigurasi dibaca dari `backend/.env` (lihat `backend/.env.example`). Jangan
meng-commit file `.env`.

## Frontend

```
cd frontend
npm install
npm start        # ng serve, proxy /api ke backend
npm test         # ng test
npm run build    # ng build
```

API base URL dipusatkan di `frontend/src/environments/environment.ts` dan
dipapar lewat token `API_BASE_URL`.
