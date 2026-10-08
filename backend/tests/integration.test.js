require("dotenv").config();

const { test, before, after } = require("node:test");
const assert = require("node:assert");
const crypto = require("crypto");

const app = require("../src/app");
const db = require("../src/config/database");

let server;
let base;

const tracked = {
    kelasIds: [],
    siswaIds: [],
    userIds: [],
    tagihanIds: [],
    orderIds: [],
    taIds: [],
};

const rand = () => Math.random().toString(36).slice(2, 8).toUpperCase();
const randNisn = () =>
    "9" + String(Math.floor(100000000 + Math.random() * 899999999));

let adminToken;
let studentToken;
let studentNisn;
let studentId;
let tagihanId;

async function api(method, path, { token, body } = {}) {
    const headers = {};
    if (body) headers["Content-Type"] = "application/json";
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(base + path, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    let json = null;
    try {
        json = await res.json();
    } catch {
        json = null;
    }

    return { status: res.status, body: json };
}

before(
    () =>
        new Promise((resolve) => {
            server = app.listen(0, () => {
                base = `http://127.0.0.1:${server.address().port}/api`;
                resolve();
            });
        })
);

after(async () => {
    try {
        if (tracked.orderIds.length) {
            await db.query(
                `DELETE FROM transaksi WHERE order_id IN (${tracked.orderIds
                    .map(() => "?")
                    .join(",")})`,
                tracked.orderIds
            );
        }
        if (tracked.tagihanIds.length) {
            await db.query(
                `DELETE FROM tagihan WHERE id IN (${tracked.tagihanIds
                    .map(() => "?")
                    .join(",")})`,
                tracked.tagihanIds
            );
        }
        if (tracked.siswaIds.length) {
            await db.query(
                `DELETE FROM siswa WHERE id IN (${tracked.siswaIds
                    .map(() => "?")
                    .join(",")})`,
                tracked.siswaIds
            );
        }
        if (tracked.userIds.length) {
            await db.query(
                `DELETE FROM users WHERE id IN (${tracked.userIds
                    .map(() => "?")
                    .join(",")})`,
                tracked.userIds
            );
        }
        if (tracked.kelasIds.length) {
            await db.query(
                `DELETE FROM kelas WHERE id IN (${tracked.kelasIds
                    .map(() => "?")
                    .join(",")})`,
                tracked.kelasIds
            );
        }
        if (tracked.taIds.length) {
            await db.query(
                `DELETE FROM tahun_ajaran WHERE id IN (${tracked.taIds
                    .map(() => "?")
                    .join(",")})`,
                tracked.taIds
            );
        }
    } finally {
        await db.end();
        await new Promise((resolve) => server.close(resolve));
    }
});

test("admin dapat login", async () => {
    const res = await api("POST", "/auth/login", {
        body: { username: "admin", password: "admin123" },
    });

    assert.equal(res.status, 200);
    assert.ok(res.body.data.token);
    adminToken = res.body.data.token;
});

test("GET /dashboard mengembalikan statistik", async () => {
    const res = await api("GET", "/dashboard", { token: adminToken });

    assert.equal(res.status, 200);
    for (const key of [
        "totalSiswa",
        "totalTagihan",
        "totalLunas",
        "totalBelumLunas",
        "totalTransaksi",
        "totalPendapatan",
    ]) {
        assert.equal(typeof res.body.data[key], "number", `field ${key} hilang`);
    }
});

test("CRUD kelas berfungsi (create/read/update/delete)", async () => {
    const jurusan = `TEST${rand()}`;

    const created = await api("POST", "/kelas", {
        token: adminToken,
        body: { tingkat: "XII", jurusan },
    });
    assert.equal(created.status, 201);
    const kelasId = created.body.data.id;
    tracked.kelasIds.push(kelasId);

    const read = await api("GET", `/kelas/${kelasId}`, { token: adminToken });
    assert.equal(read.status, 200);
    assert.equal(read.body.data.jurusan, jurusan);

    const updated = await api("PUT", `/kelas/${kelasId}`, {
        token: adminToken,
        body: { tingkat: "XI", jurusan },
    });
    assert.equal(updated.status, 200);
    assert.equal(updated.body.data.tingkat, "XI");

    const removed = await api("DELETE", `/kelas/${kelasId}`, {
        token: adminToken,
    });
    assert.equal(removed.status, 200);
    tracked.kelasIds = tracked.kelasIds.filter((id) => id !== kelasId);
});

test("alur utama admin: buat siswa + tagihan, siswa lihat tagihan", async () => {
    const kelas = await api("POST", "/kelas", {
        token: adminToken,
        body: { tingkat: "XII", jurusan: `TEST${rand()}` },
    });
    assert.equal(kelas.status, 201);
    const kelasId = kelas.body.data.id;
    tracked.kelasIds.push(kelasId);

    studentNisn = randNisn();
    const siswa = await api("POST", "/siswa", {
        token: adminToken,
        body: {
            kelasId,
            nisn: studentNisn,
            nama: "Siswa Uji",
            jenisKelamin: "L",
            alamat: "Alamat pengujian minimal",
            noHp: "081234567890",
        },
    });
    assert.equal(siswa.status, 201, JSON.stringify(siswa.body));
    studentId = siswa.body.data.id;
    tracked.siswaIds.push(studentId);
    if (siswa.body.data.user_id) tracked.userIds.push(siswa.body.data.user_id);

    const tagihan = await api("POST", "/tagihan", {
        token: adminToken,
        body: {
            siswaId: studentId,
            tahunAjaranId: 1,
            bulan: 9,
            tahun: 2025,
            nominal: 150000,
            jatuhTempo: "2025-09-10",
            keterangan: "SPP September (uji)",
        },
    });
    assert.equal(tagihan.status, 201, JSON.stringify(tagihan.body));
    assert.equal(tagihan.body.data.status, "BELUM_LUNAS");
    tagihanId = tagihan.body.data.id;
    tracked.tagihanIds.push(tagihanId);

    const login = await api("POST", "/auth/login", {
        body: { username: studentNisn, password: studentNisn },
    });
    assert.equal(login.status, 200);
    studentToken = login.body.data.token;

    const list = await api("GET", "/tagihan", { token: studentToken });
    assert.equal(list.status, 200);
    assert.ok(list.body.data.some((t) => t.id === tagihanId));
});

test("siswa tidak bisa membayar tagihan milik siswa lain (403)", async () => {
    const nisn2 = randNisn();
    const siswa2 = await api("POST", "/siswa", {
        token: adminToken,
        body: {
            kelasId: tracked.kelasIds[tracked.kelasIds.length - 1],
            nisn: nisn2,
            nama: "Siswa Lain",
            jenisKelamin: "P",
            alamat: "Alamat pengujian minimal",
            noHp: "081234567891",
        },
    });
    assert.equal(siswa2.status, 201);
    tracked.siswaIds.push(siswa2.body.data.id);
    if (siswa2.body.data.user_id) tracked.userIds.push(siswa2.body.data.user_id);

    const tagihan2 = await api("POST", "/tagihan", {
        token: adminToken,
        body: {
            siswaId: siswa2.body.data.id,
            tahunAjaranId: 1,
            bulan: 10,
            tahun: 2025,
            nominal: 150000,
            jatuhTempo: "2025-10-10",
            keterangan: "SPP Oktober (uji)",
        },
    });
    assert.equal(tagihan2.status, 201);
    tracked.tagihanIds.push(tagihan2.body.data.id);

    const res = await api("POST", "/transaksi", {
        token: studentToken,
        body: { tagihanId: tagihan2.body.data.id },
    });
    assert.equal(res.status, 403);
});

test("POST /transaksi membuat Snap QRIS (create payment Midtrans)", async () => {
    const res = await api("POST", "/transaksi", {
        token: studentToken,
        body: { tagihanId },
    });

    assert.equal(res.status, 201, JSON.stringify(res.body));
    assert.ok(res.body.data.snapToken, "snap token tidak ada");
    assert.ok(res.body.data.paymentUrl, "payment url tidak ada");
    assert.match(res.body.data.paymentUrl, /midtrans\.com/);
    tracked.orderIds.push(res.body.data.orderId);
});

test("webhook SETTLEMENT mengubah transaksi dan tagihan menjadi LUNAS", async () => {
    const orderId = tracked.orderIds[tracked.orderIds.length - 1];
    const statusCode = "200";
    const grossAmount = "150000.00";
    const serverKey = process.env.MIDTRANS_SERVER_KEY;

    const signatureKey = crypto
        .createHash("sha512")
        .update(orderId + statusCode + grossAmount + serverKey)
        .digest("hex");

    const payload = {
        order_id: orderId,
        status_code: statusCode,
        gross_amount: grossAmount,
        signature_key: signatureKey,
        transaction_status: "settlement",
        fraud_status: "accept",
        payment_type: "qris",
        transaction_time: "2025-09-10 08:00:00",
        settlement_time: "2025-09-10 08:00:05",
    };

    const res = await api("POST", "/transaksi/webhook", { body: payload });
    assert.equal(res.status, 200, JSON.stringify(res.body));
    assert.equal(res.body.data.transactionStatus, "SETTLEMENT");

    const [trx] = await db.query(
        "SELECT transaction_status FROM transaksi WHERE order_id = ?",
        [orderId]
    );
    assert.equal(trx[0].transaction_status, "SETTLEMENT");

    const [tagihan] = await db.query("SELECT status FROM tagihan WHERE id = ?", [
        tagihanId,
    ]);
    assert.equal(tagihan[0].status, "LUNAS");
});

test("webhook menolak signature tidak valid", async () => {
    const res = await api("POST", "/transaksi/webhook", {
        body: {
            order_id: "SPP-INVALID-0001",
            status_code: "200",
            gross_amount: "150000.00",
            signature_key: "invalid",
            transaction_status: "settlement",
        },
    });

    assert.notEqual(res.status, 200);
});

test("riwayat transaksi dapat dilihat siswa dan admin", async () => {
    const asStudent = await api("GET", "/transaksi", { token: studentToken });
    assert.equal(asStudent.status, 200);
    assert.ok(asStudent.body.data.some((t) => t.order_id));

    const asAdmin = await api("GET", "/transaksi", { token: adminToken });
    assert.equal(asAdmin.status, 200);
    assert.ok(Array.isArray(asAdmin.body.data));
});

test("auth: /me dan register", async () => {
    const me = await api("GET", "/auth/me", { token: adminToken });
    assert.equal(me.status, 200);
    assert.equal(me.body.data.role, "ADMIN");

    const username = `test${rand().toLowerCase()}`;
    const register = await api("POST", "/auth/register", {
        body: { username, password: "rahasia123" },
    });
    assert.equal(register.status, 201, JSON.stringify(register.body));
    tracked.userIds.push(register.body.data.id);

    const login = await api("POST", "/auth/login", {
        body: { username, password: "rahasia123" },
    });
    assert.equal(login.status, 200);
    assert.equal(login.body.data.user.role, "SISWA");
});

test("kelas: GET semua data", async () => {
    const res = await api("GET", "/kelas", { token: adminToken });
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.data));
});

test("siswa: update dan delete", async () => {
    const kelas = await api("POST", "/kelas", {
        token: adminToken,
        body: { tingkat: "X", jurusan: `TEST${rand()}` },
    });
    assert.equal(kelas.status, 201);
    tracked.kelasIds.push(kelas.body.data.id);

    const nisn = randNisn();
    const created = await api("POST", "/siswa", {
        token: adminToken,
        body: {
            kelasId: kelas.body.data.id,
            nisn,
            nama: "Siswa Update",
            jenisKelamin: "L",
            alamat: "Alamat pengujian minimal",
            noHp: "081234567892",
        },
    });
    assert.equal(created.status, 201);
    const id = created.body.data.id;
    if (created.body.data.user_id) tracked.userIds.push(created.body.data.user_id);

    const list = await api("GET", "/siswa", { token: adminToken });
    assert.equal(list.status, 200);
    assert.ok(list.body.data.some((s) => s.id === id));

    const detail = await api("GET", `/siswa/${id}`, { token: adminToken });
    assert.equal(detail.status, 200);

    const updated = await api("PUT", `/siswa/${id}`, {
        token: adminToken,
        body: {
            kelasId: kelas.body.data.id,
            nisn,
            nama: "Siswa Update Revisi",
            jenisKelamin: "L",
            alamat: "Alamat pengujian minimal",
            noHp: "081234567892",
        },
    });
    assert.equal(updated.status, 200);
    assert.equal(updated.body.data.nama, "Siswa Update Revisi");

    const removed = await api("DELETE", `/siswa/${id}`, { token: adminToken });
    assert.equal(removed.status, 200);
});

test("tagihan: get by id, update, delete", async () => {
    const kelas = await api("POST", "/kelas", {
        token: adminToken,
        body: { tingkat: "X", jurusan: `TEST${rand()}` },
    });
    assert.equal(kelas.status, 201);
    tracked.kelasIds.push(kelas.body.data.id);

    const nisn = randNisn();
    const siswa = await api("POST", "/siswa", {
        token: adminToken,
        body: {
            kelasId: kelas.body.data.id,
            nisn,
            nama: "Siswa Tagihan",
            jenisKelamin: "L",
            alamat: "Alamat pengujian minimal",
            noHp: "081234567893",
        },
    });
    assert.equal(siswa.status, 201);
    tracked.siswaIds.push(siswa.body.data.id);
    if (siswa.body.data.user_id) tracked.userIds.push(siswa.body.data.user_id);

    const created = await api("POST", "/tagihan", {
        token: adminToken,
        body: {
            siswaId: siswa.body.data.id,
            tahunAjaranId: 1,
            bulan: 11,
            tahun: 2025,
            nominal: 100000,
            jatuhTempo: "2025-11-10",
            keterangan: "SPP November (uji)",
        },
    });
    assert.equal(created.status, 201);
    const id = created.body.data.id;

    const detail = await api("GET", `/tagihan/${id}`, { token: adminToken });
    assert.equal(detail.status, 200);

    const updated = await api("PUT", `/tagihan/${id}`, {
        token: adminToken,
        body: {
            siswaId: siswa.body.data.id,
            tahunAjaranId: 1,
            bulan: 11,
            tahun: 2025,
            nominal: 120000,
            jatuhTempo: "2025-11-15",
            keterangan: "SPP November revisi",
        },
    });
    assert.equal(updated.status, 200);
    assert.equal(Number(updated.body.data.nominal), 120000);

    const removed = await api("DELETE", `/tagihan/${id}`, { token: adminToken });
    assert.equal(removed.status, 200);
});

test("tahun ajaran: create, list, activate", async () => {
    const nama = `TA-${rand()}`;
    const created = await api("POST", "/tahun-ajaran", {
        token: adminToken,
        body: { nama, semester: "GANJIL", aktif: false },
    });
    assert.equal(created.status, 201, JSON.stringify(created.body));
    const id = created.body.data.id;
    tracked.taIds.push(id);

    const list = await api("GET", "/tahun-ajaran", { token: adminToken });
    assert.equal(list.status, 200);
    assert.ok(list.body.data.some((t) => t.id === id));

    const activate = await api("PATCH", `/tahun-ajaran/${id}/activate`, {
        token: adminToken,
    });
    assert.equal(activate.status, 200);

    // Kembalikan tahun ajaran seed sebagai yang aktif.
    await api("PATCH", "/tahun-ajaran/1/activate", { token: adminToken });
});

test("dashboard hanya untuk admin", async () => {
    const res = await api("GET", "/dashboard", { token: studentToken });
    assert.equal(res.status, 403);
});
