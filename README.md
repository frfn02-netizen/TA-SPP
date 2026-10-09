# TA SPP QRIS

School tuition (SPP) administration and payment system with QRIS payments through
Midtrans. This is a monorepo containing an Express + MySQL backend and an
Angular frontend with a role-based admin panel and student portal.

![Angular](https://img.shields.io/badge/Angular-22-DD0031?logo=angular&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-22%2B-339933?logo=nodedotjs&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Midtrans](https://img.shields.io/badge/Payments-Midtrans_QRIS-1a1a1a)

## Overview

Managing monthly tuition at a school with hundreds of students is error prone when
done with spreadsheets: bills are duplicated, payment status is unclear, and
receipts are inconsistent. TA SPP QRIS centralises this work:

- Administrators manage master data (students, classes, academic years), generate
  monthly bills (individually or in bulk), and monitor collections.
- Students see their own bills, pay them with QRIS through Midtrans, review their
  payment history, and download a PDF payment receipt.

Access is role based (`ADMIN` and `SISWA`) and data ownership is enforced by the
backend: students can only read their own bills and transactions.

## Features

### Administrator

- Dashboard with aggregate statistics (students, bills, paid/unpaid, transactions,
  total revenue) and a bill-status chart.
- Student management (create, read, update, delete).
- Class management (create, read, update, delete).
- Academic year management with a single active year at a time.
- Bill management with search and status filters, including bulk bill generation
  with a preview and duplicate protection.
- Transaction history with detail view and PDF receipt download.

### Student

- Student dashboard summarising unpaid bills, totals, and recent transactions.
- Bill list with status.
- QRIS payment through Midtrans Snap (redirect flow).
- Payment history.
- PDF payment receipt download for settled transactions.

## Technology Stack

**Backend**

- Node.js, Express 5
- MySQL (via `mysql2`)
- Zod for request validation
- `jsonwebtoken` (JWT) and `bcrypt` for authentication
- `midtrans-client` for QRIS payments
- `helmet`, `cors`, `morgan`, `cookie-parser`
- Tests with the built-in Node.js test runner (`node --test`)

**Frontend**

- Angular 22 (standalone components, signals)
- TypeScript
- Tailwind CSS 4 (CSS-first `@theme` tokens)
- `lucide-angular` icons, `@fontsource/plus-jakarta-sans`
- `jspdf` for client-side PDF receipt generation
- Unit tests with Vitest through the Angular builder

## Architecture and Project Structure

```text
TA-SPP/
├── backend/            # Express REST API + MySQL access
│   ├── database/       # schema.sql and seed.sql
│   ├── docs/           # API, architecture, database, and flow notes
│   ├── scripts/        # reset-db.js (apply schema + seed)
│   ├── src/            # app, config, middlewares, modules, services, utils
│   ├── tests/          # unit, integration, and bulk-billing tests
│   ├── .env.example
│   └── package.json
├── frontend/           # Angular application (admin panel + student portal)
│   ├── public/
│   ├── src/
│   │   ├── app/        # core (auth, services, models), features, shared UI, layouts
│   │   ├── assets/     # school logo and login illustration
│   │   └── environments/
│   ├── angular.json
│   ├── proxy.conf.json
│   └── package.json
├── .gitignore
└── README.md
```

- `backend/` owns all business rules, authentication, ownership checks, and the
  Midtrans integration.
- `frontend/` is a single Angular application that serves the admin panel under
  `/admin/*` and the student portal under `/siswa/*`, selected by role.

## Prerequisites

- Node.js 22 or newer (developed with Node 26); npm 10 or newer
- MySQL 8.x
- A Midtrans account (sandbox is sufficient for development) for the payment flow

## Installation and Local Development

### 1. Clone the repository

```bash
git clone https://github.com/frfn02-netizen/TA-SPP.git
cd TA-SPP
```

### 2. Backend

```bash
cd backend
npm install
```

Create the environment file from the template and adjust it:

```bash
cp .env.example .env
# edit .env (database credentials, JWT secret, Midtrans keys)
```

Create the database and load the schema and seed data:

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS spp_qris CHARACTER SET utf8mb4;"
npm run db:reset
```

`npm run db:reset` applies `database/schema.sql` (drops and recreates the tables)
then `database/seed.sql` (initial classes, academic year, students, bills, and a
sample settled transaction). The seed also creates an initial administrator
account; refer to `backend/database/seed.sql` for the accounts it inserts.

Run the API for local development:

```bash
npm run dev      # nodemon src/server.js
# or
npm start        # node src/server.js
```

The server listens on `PORT` from `.env` (default `5000`). The Angular dev proxy
targets `http://localhost:5055`, so set `PORT=5055` in `backend/.env` for the
standard local setup, or update `frontend/proxy.conf.json`.

### 3. Frontend

```bash
cd ../frontend
npm install
npm start        # ng serve on http://localhost:4200
```

During development the dev server proxies `/api` to the backend
(`frontend/proxy.conf.json`). The API base URL is centralised in
`src/environments/environment.ts` and provided through the `API_BASE_URL` token.

## Environment Configuration

Backend variables (see `backend/.env.example`). No real secrets are committed.

| Variable | Description |
|----------|-------------|
| `PORT` | HTTP port for the API (default `5000`) |
| `DB_HOST` | MySQL host |
| `DB_USER` | MySQL user |
| `DB_PASSWORD` | MySQL password |
| `DB_NAME` | MySQL database name (for example `spp_qris`) |
| `JWT_SECRET` | Secret used to sign JWT access tokens |
| `MIDTRANS_SERVER_KEY` | Midtrans server key |
| `MIDTRANS_CLIENT_KEY` | Midtrans client key |
| `MIDTRANS_IS_PRODUCTION` | `true` for production, `false` for sandbox |

The frontend reads `apiBaseUrl` from `src/environments/environment.ts`. Keep
`backend/.env` out of version control; only `.env.example` is committed.

## API Overview

Base path: `/api`. Protected endpoints require an `Authorization: Bearer <token>`
header. The token is issued by `POST /api/auth/login`.

### Authentication

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/api/auth/register` | Public | Register a new student account |
| POST | `/api/auth/login` | Public | Log in and receive a JWT |
| GET | `/api/auth/me` | Authenticated | Return the current user |

### Students

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/api/siswa` | ADMIN | List students |
| GET | `/api/siswa/:id` | ADMIN | Student detail |
| POST | `/api/siswa` | ADMIN | Create a student |
| PUT | `/api/siswa/:id` | ADMIN | Update a student |
| DELETE | `/api/siswa/:id` | ADMIN | Delete a student |

### Classes

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/api/kelas` | ADMIN | List classes |
| GET | `/api/kelas/:id` | ADMIN | Class detail |
| POST | `/api/kelas` | ADMIN | Create a class |
| PUT | `/api/kelas/:id` | ADMIN | Update a class |
| DELETE | `/api/kelas/:id` | ADMIN | Delete a class |

### Academic Years

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/api/tahun-ajaran` | ADMIN | List academic years |
| POST | `/api/tahun-ajaran` | ADMIN | Create an academic year |
| PATCH | `/api/tahun-ajaran/:id/activate` | ADMIN | Activate an academic year |

### Bills (Tagihan)

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/api/tagihan` | ADMIN, SISWA | List bills (students see their own) |
| GET | `/api/tagihan/:id` | ADMIN, SISWA | Bill detail (students are owner scoped) |
| POST | `/api/tagihan` | ADMIN | Create a bill |
| PUT | `/api/tagihan/:id` | ADMIN | Update a bill |
| DELETE | `/api/tagihan/:id` | ADMIN | Delete a bill |
| GET | `/api/tagihan/bulk-preview` | ADMIN | Preview bulk bill generation (no writes) |
| POST | `/api/tagihan/bulk-generate` | ADMIN | Create bills in bulk with duplicate protection |

### Transactions

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/api/transaksi` | SISWA | Create or reuse a QRIS payment for a bill |
| GET | `/api/transaksi` | ADMIN, SISWA | List transactions (students see their own) |
| GET | `/api/transaksi/:id` | ADMIN, SISWA | Transaction detail (owner scoped) |
| POST | `/api/transaksi/webhook` | Public | Midtrans notification webhook |

### Dashboard

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/api/dashboard` | ADMIN | Aggregate statistics |

## Payment Flow

1. A student opens a bill and starts payment. The frontend calls
   `POST /api/transaksi` with the bill id.
2. The backend validates ownership and the bill status, creates (or reuses) a
   Midtrans Snap transaction, and returns `orderId`, `snapToken`, and
   `paymentUrl`.
3. The frontend validates that `paymentUrl` is a trusted Midtrans HTTPS URL and
   redirects the browser to the hosted Snap page. The `snapToken` is not embedded
   and no client key is exposed.
4. Midtrans sends the final status to the public webhook
   `POST /api/transaksi/webhook`. The backend verifies the Midtrans signature and
   maps the transaction status. On `SETTLEMENT` it sets the transaction to
   `SETTLEMENT` and the related bill to `LUNAS`.
5. The application never marks a payment as paid on its own. Students refresh or
   use the "check status" action to read the latest backend state.
6. The PDF payment receipt is generated entirely in the frontend (jsPDF) and is
   only offered for transactions that the backend reports as `SETTLEMENT` with a
   `LUNAS` bill.

The Midtrans integration has been exercised against the development/sandbox
backend only; it has not been verified in a production environment.

## Testing and Production Build

**Backend** (Node test runner; requires a running MySQL instance with the schema
and seed loaded, and Midtrans sandbox credentials for the payment integration
test):

```bash
cd backend
npm test          # node --test tests/
```

**Frontend**:

```bash
cd frontend
npx ng test --watch=false   # unit tests (Vitest)
npm run build               # production build (ng build)
```

## Security Notes

- Secrets are read from the environment only. `.env` files are git-ignored and must
  never be committed; only `.env.example` with placeholders is tracked.
- Authentication uses JWT bearer tokens. Protected endpoints require a valid token,
  and administrative routes additionally require the `ADMIN` role.
- Student bills and transactions are owner scoped: a student can only read their
  own records.
- Payment status is authoritative on the backend (updated through the verified
  Midtrans webhook). The frontend never changes payment status.
- Midtrans keys must be configured for the correct environment
  (`MIDTRANS_IS_PRODUCTION`). Local development should use sandbox keys.
- Do not share JWT secrets, database passwords, Midtrans keys, or student data.

## License

No license has been defined for this repository yet.

## Screenshots

No screenshots are included in this repository.
