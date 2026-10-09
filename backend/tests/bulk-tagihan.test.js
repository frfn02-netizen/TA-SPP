require("dotenv").config();

const { test, before, after } = require("node:test");
const assert = require("node:assert");

const app = require("../src/app");
const db = require("../src/config/database");

let server;
let base;

let adminToken;
let studentToken;
let tahunAjaranId;

let testKelasId;
const testSiswaIds = [];
const testUserIds = [];

const TEST_BULAN = 6;
const TEST_TAHUN = 2099;
const TEST_NOMINAL = 123456;
const TARGET_COUNT = 3;

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

async function countSiswa(kelasId = null) {
    if (kelasId) {
        const [rows] = await db.query(
            "SELECT COUNT(*) AS total FROM siswa WHERE kelas_id = ?",
            [kelasId]
        );
        return rows[0].total;
    }
    const [rows] = await db.query("SELECT COUNT(*) AS total FROM siswa");
    return rows[0].total;
}

before(async () => {
    await new Promise((resolve) => {
        server = app.listen(0, () => {
            base = `http://127.0.0.1:${server.address().port}/api`;
            resolve();
        });
    });

    const login = await api("POST", "/auth/login", {
        body: { username: "admin", password: "admin123" },
    });
    assert.equal(login.status, 200, JSON.stringify(login.body));
    adminToken = login.body.data.token;

    const ta = await api("GET", "/tahun-ajaran", { token: adminToken });
    assert.equal(ta.status, 200);
    assert.ok(ta.body.data.length > 0, "seed tahun ajaran tidak ada");
    tahunAjaranId = ta.body.data[0].id;

    // Kelas uji khusus agar hitungan tidak terpengaruh test lain.
    const kelas = await api("POST", "/kelas", {
        token: adminToken,
        body: {
            tingkat: "XII",
            jurusan: `BULK${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
        },
    });
    assert.equal(kelas.status, 201, JSON.stringify(kelas.body));
    testKelasId = kelas.body.data.id;

    for (let i = 0; i < TARGET_COUNT; i += 1) {
        const nisn = `8${String(Date.now()).slice(-8)}${i}`;
        const created = await api("POST", "/siswa", {
            token: adminToken,
            body: {
                kelasId: testKelasId,
                nisn,
                nama: `Siswa Bulk ${i + 1}`,
                jenisKelamin: "L",
                alamat: "Alamat pengujian bulk",
                noHp: `0812345678${i}0`,
            },
        });
        assert.equal(created.status, 201, JSON.stringify(created.body));
        testSiswaIds.push(created.body.data.id);
        testUserIds.push(created.body.data.user_id);

        if (i === 0) {
            const studentLogin = await api("POST", "/auth/login", {
                body: { username: nisn, password: nisn },
            });
            assert.equal(studentLogin.status, 200);
            studentToken = studentLogin.body.data.token;
        }
    }
});

after(async () => {
    try {
        if (testSiswaIds.length) {
            const placeholders = testSiswaIds.map(() => "?").join(",");
            await db.query(
                `DELETE FROM tagihan WHERE siswa_id IN (${placeholders})`,
                testSiswaIds
            );
        }

        // Sisa baris periode uji yang mungkin ada.
        await db.query(
            "DELETE FROM tagihan WHERE tahun = ?",
            [TEST_TAHUN]
        );

        if (testSiswaIds.length) {
            const placeholders = testSiswaIds.map(() => "?").join(",");
            await db.query(
                `DELETE FROM siswa WHERE id IN (${placeholders})`,
                testSiswaIds
            );
        }

        if (testUserIds.length) {
            const placeholders = testUserIds.map(() => "?").join(",");
            await db.query(
                `DELETE FROM users WHERE id IN (${placeholders})`,
                testUserIds
            );
        }

        if (testKelasId) {
            await db.query("DELETE FROM kelas WHERE id = ?", [testKelasId]);
        }
    } finally {
        await db.end();
        await new Promise((resolve) => server.close(resolve));
    }
});

test("pengguna anonim ditolak 401", async () => {
    const preview = await api(
        "GET",
        `/tagihan/bulk-preview?tahunAjaranId=${tahunAjaranId}&bulan=${TEST_BULAN}&tahun=${TEST_TAHUN}&nominal=${TEST_NOMINAL}`
    );
    assert.equal(preview.status, 401);

    const generate = await api("POST", "/tagihan/bulk-generate", {
        body: {
            tahunAjaranId,
            bulan: TEST_BULAN,
            tahun: TEST_TAHUN,
            nominal: TEST_NOMINAL,
            jatuhTempo: "2099-06-10",
        },
    });
    assert.equal(generate.status, 401);
});

test("SISWA ditolak 403", async () => {
    const preview = await api(
        "GET",
        `/tagihan/bulk-preview?tahunAjaranId=${tahunAjaranId}&bulan=${TEST_BULAN}&tahun=${TEST_TAHUN}&nominal=${TEST_NOMINAL}`,
        { token: studentToken }
    );
    assert.equal(preview.status, 403);

    const generate = await api("POST", "/tagihan/bulk-generate", {
        token: studentToken,
        body: {
            tahunAjaranId,
            bulan: TEST_BULAN,
            tahun: TEST_TAHUN,
            nominal: TEST_NOMINAL,
            jatuhTempo: "2099-06-10",
        },
    });
    assert.equal(generate.status, 403);
});

test("input tidak valid ditolak 400", async () => {
    const res = await api("POST", "/tagihan/bulk-generate", {
        token: adminToken,
        body: {
            tahunAjaranId,
            bulan: 13,
            tahun: 1999,
            nominal: -5,
            jatuhTempo: "bukan-tanggal",
        },
    });
    assert.equal(res.status, 400);
});

test("tahun ajaran atau kelas tidak valid 404", async () => {
    const ta = await api(
        "GET",
        `/tagihan/bulk-preview?tahunAjaranId=999999&bulan=${TEST_BULAN}&tahun=${TEST_TAHUN}&nominal=${TEST_NOMINAL}`,
        { token: adminToken }
    );
    assert.equal(ta.status, 404);

    const kelas = await api(
        "GET",
        `/tagihan/bulk-preview?tahunAjaranId=${tahunAjaranId}&bulan=${TEST_BULAN}&tahun=${TEST_TAHUN}&nominal=${TEST_NOMINAL}&kelasId=999999`,
        { token: adminToken }
    );
    assert.equal(kelas.status, 404);
});

test("preview target semua siswa sesuai data database", async () => {
    const expectedTotal = await countSiswa();

    const res = await api(
        "GET",
        `/tagihan/bulk-preview?tahunAjaranId=${tahunAjaranId}&bulan=${TEST_BULAN}&tahun=${TEST_TAHUN}&nominal=${TEST_NOMINAL}`,
        { token: adminToken }
    );

    assert.equal(res.status, 200);
    const data = res.body.data;
    assert.equal(data.target.scope, "ALL");
    assert.equal(data.totalTarget, expectedTotal);
    assert.equal(data.willCreate + data.skipped, data.totalTarget);
    assert.equal(data.totalNominal, TEST_NOMINAL * data.willCreate);
});

test("preview target satu kelas sesuai data database", async () => {
    const res = await api(
        "GET",
        `/tagihan/bulk-preview?tahunAjaranId=${tahunAjaranId}&bulan=${TEST_BULAN}&tahun=${TEST_TAHUN}&nominal=${TEST_NOMINAL}&kelasId=${testKelasId}`,
        { token: adminToken }
    );

    assert.equal(res.status, 200);
    const data = res.body.data;
    assert.equal(data.target.scope, "KELAS");
    assert.equal(data.target.kelasId, testKelasId);
    assert.equal(data.totalTarget, TARGET_COUNT);
    assert.equal(data.willCreate, TARGET_COUNT);
    assert.equal(data.skipped, 0);
    assert.equal(data.totalNominal, TEST_NOMINAL * TARGET_COUNT);
});

test("generate untuk satu kelas membuat tagihan dan hitungan benar", async () => {
    const res = await api("POST", "/tagihan/bulk-generate", {
        token: adminToken,
        body: {
            tahunAjaranId,
            bulan: TEST_BULAN,
            tahun: TEST_TAHUN,
            nominal: TEST_NOMINAL,
            jatuhTempo: "2099-06-10",
            kelasId: testKelasId,
        },
    });

    assert.equal(res.status, 201, JSON.stringify(res.body));
    const data = res.body.data;
    assert.equal(data.created, TARGET_COUNT);
    assert.equal(data.skipped, 0);
    assert.equal(data.failed, 0);
    assert.equal(data.totalNominal, TEST_NOMINAL * TARGET_COUNT);

    const placeholders = testSiswaIds.map(() => "?").join(",");
    const [rows] = await db.query(
        `SELECT COUNT(*) AS total FROM tagihan WHERE tahun_ajaran_id = ? AND bulan = ? AND tahun = ? AND siswa_id IN (${placeholders})`,
        [tahunAjaranId, TEST_BULAN, TEST_TAHUN, ...testSiswaIds]
    );
    assert.equal(rows[0].total, TARGET_COUNT);
});

test("request generate berulang tidak membuat duplikat", async () => {
    const res = await api("POST", "/tagihan/bulk-generate", {
        token: adminToken,
        body: {
            tahunAjaranId,
            bulan: TEST_BULAN,
            tahun: TEST_TAHUN,
            nominal: TEST_NOMINAL,
            jatuhTempo: "2099-06-10",
            kelasId: testKelasId,
        },
    });

    assert.equal(res.status, 201);
    assert.equal(res.body.data.created, 0);
    assert.equal(res.body.data.skipped, TARGET_COUNT);

    const placeholders = testSiswaIds.map(() => "?").join(",");
    const [rows] = await db.query(
        `SELECT COUNT(*) AS total FROM tagihan WHERE tahun_ajaran_id = ? AND bulan = ? AND tahun = ? AND siswa_id IN (${placeholders})`,
        [tahunAjaranId, TEST_BULAN, TEST_TAHUN, ...testSiswaIds]
    );
    assert.equal(rows[0].total, TARGET_COUNT);
});

test("preview menandai tagihan yang sudah ada sebagai dilewati", async () => {
    const res = await api(
        "GET",
        `/tagihan/bulk-preview?tahunAjaranId=${tahunAjaranId}&bulan=${TEST_BULAN}&tahun=${TEST_TAHUN}&nominal=${TEST_NOMINAL}&kelasId=${testKelasId}`,
        { token: adminToken }
    );

    assert.equal(res.status, 200);
    assert.equal(res.body.data.willCreate, 0);
    assert.equal(res.body.data.skipped, TARGET_COUNT);
});

test("tagihan lama dan LUNAS tidak diubah", async () => {
    const placeholders = testSiswaIds.map(() => "?").join(",");
    const [rows] = await db.query(
        `SELECT id, nominal, status FROM tagihan WHERE tahun_ajaran_id = ? AND bulan = ? AND tahun = ? AND siswa_id IN (${placeholders}) LIMIT 1`,
        [tahunAjaranId, TEST_BULAN, TEST_TAHUN, ...testSiswaIds]
    );
    assert.ok(rows.length > 0);
    const original = rows[0];

    await db.query("UPDATE tagihan SET status = 'LUNAS' WHERE id = ?", [
        original.id,
    ]);

    const res = await api("POST", "/tagihan/bulk-generate", {
        token: adminToken,
        body: {
            tahunAjaranId,
            bulan: TEST_BULAN,
            tahun: TEST_TAHUN,
            nominal: TEST_NOMINAL,
            jatuhTempo: "2099-06-10",
            kelasId: testKelasId,
        },
    });

    assert.equal(res.status, 201);
    assert.equal(res.body.data.created, 0);
    assert.ok(res.body.data.skipped >= 1);

    const [after] = await db.query(
        "SELECT nominal, status FROM tagihan WHERE id = ?",
        [original.id]
    );
    assert.equal(after[0].status, "LUNAS");
    assert.equal(String(after[0].nominal), String(original.nominal));
});

test("rollback menyeluruh saat terjadi error database di tengah batch", async () => {
    const [modeRows] = await db.query("SELECT @@sql_mode AS mode");
    const strict = String(modeRows[0].mode).includes("STRICT_TRANS_TABLES");

    const res = await api("POST", "/tagihan/bulk-generate", {
        token: adminToken,
        body: {
            tahunAjaranId,
            bulan: 7,
            tahun: TEST_TAHUN,
            // Melebihi DECIMAL(12,2) -> memicu error database.
            nominal: 999999999999999,
            jatuhTempo: "2099-07-10",
            kelasId: testKelasId,
        },
    });

    if (strict) {
        assert.equal(res.status, 500);
    }

    const placeholders = testSiswaIds.map(() => "?").join(",");
    const [rows] = await db.query(
        `SELECT COUNT(*) AS total FROM tagihan WHERE tahun_ajaran_id = ? AND bulan = 7 AND tahun = ? AND siswa_id IN (${placeholders})`,
        [tahunAjaranId, TEST_TAHUN, ...testSiswaIds]
    );
    assert.equal(rows[0].total, 0);
});

test("ratusan siswa diproses tanpa timeout", async () => {
    const N = 200;
    const stamp = Date.now();
    const bulan = 9;

    const kelasRes = await api("POST", "/kelas", {
        token: adminToken,
        body: {
            tingkat: "XI",
            jurusan: `PERF${String(stamp).slice(-5)}`,
        },
    });
    assert.equal(kelasRes.status, 201, JSON.stringify(kelasRes.body));
    const perfKelasId = kelasRes.body.data.id;

    let firstUserId = 0;
    let firstSiswaId = 0;

    try {
        const userValues = [];
        const userParams = [];
        for (let i = 0; i < N; i += 1) {
            userValues.push("(?, ?, ?, ?)");
            userParams.push(`perf_${stamp}_${i}`, "x", "SISWA", 1);
        }
        const [usersResult] = await db.query(
            `INSERT INTO users (username, password, role, is_active) VALUES ${userValues.join(",")}`,
            userParams
        );
        firstUserId = usersResult.insertId;

        const siswaValues = [];
        const siswaParams = [];
        for (let i = 0; i < N; i += 1) {
            siswaValues.push("(?, ?, ?, ?, ?, ?)");
            siswaParams.push(
                firstUserId + i,
                perfKelasId,
                `perf${stamp}${i}`,
                `Siswa Perf ${i}`,
                "L",
                "Alamat perf"
            );
        }
        const [siswaResult] = await db.query(
            `INSERT INTO siswa (user_id, kelas_id, nisn, nama, jenis_kelamin, alamat) VALUES ${siswaValues.join(",")}`,
            siswaParams
        );
        firstSiswaId = siswaResult.insertId;

        const start = Date.now();
        const res = await api("POST", "/tagihan/bulk-generate", {
            token: adminToken,
            body: {
                tahunAjaranId,
                bulan,
                tahun: TEST_TAHUN,
                nominal: 1000,
                jatuhTempo: "2099-09-10",
                kelasId: perfKelasId,
            },
        });
        const elapsed = Date.now() - start;

        assert.equal(res.status, 201, JSON.stringify(res.body));
        assert.equal(res.body.data.created, N);
        assert.ok(
            elapsed < 15000,
            `generate ${N} siswa memakan ${elapsed}ms`
        );

        const [rows] = await db.query(
            "SELECT COUNT(*) AS total FROM tagihan WHERE tahun_ajaran_id = ? AND bulan = ? AND tahun = ? AND siswa_id BETWEEN ? AND ?",
            [tahunAjaranId, bulan, TEST_TAHUN, firstSiswaId, firstSiswaId + N - 1]
        );
        assert.equal(rows[0].total, N);
    } finally {
        if (firstSiswaId) {
            await db.query(
                "DELETE FROM tagihan WHERE siswa_id BETWEEN ? AND ?",
                [firstSiswaId, firstSiswaId + N - 1]
            );
            await db.query(
                "DELETE FROM siswa WHERE id BETWEEN ? AND ?",
                [firstSiswaId, firstSiswaId + N - 1]
            );
        }
        if (firstUserId) {
            await db.query(
                "DELETE FROM users WHERE id BETWEEN ? AND ?",
                [firstUserId, firstUserId + N - 1]
            );
        }
        await db.query("DELETE FROM kelas WHERE id = ?", [perfKelasId]);
    }
});
