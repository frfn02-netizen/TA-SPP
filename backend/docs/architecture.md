# Project Architecture

Project menggunakan arsitektur berlapis (Layered Architecture).

```
Client
   │
   ▼
Routes
   │
   ▼
Controller
   │
   ▼
Service
   │
   ▼
Query
   │
   ▼
Database
```

## Penjelasan Layer

### Routes

Menerima request HTTP dan meneruskan ke controller.

### Controller

Mengambil request, memanggil service, dan mengembalikan response.

### Service

Berisi business logic aplikasi.

### Query

Berisi seluruh query SQL ke database.

### Database

Menyimpan seluruh data aplikasi.

## Authentication Flow

Client

↓

JWT Middleware

↓

Controller

↓

Service

↓

Query

↓

Database

## Payment Flow

Client

↓

Transaksi Controller

↓

Payment Service

↓

Midtrans Snap

↓

Webhook

↓

Webhook Controller

↓

Webhook Service

↓

Update Database