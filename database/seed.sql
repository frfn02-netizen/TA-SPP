USE spp_qris;

-- Admin awal. Password: Admin123!
INSERT IGNORE INTO users (username, password, role, must_change_password, is_active)
VALUES (
    'admin',
    '$2b$10$cHgn0AnrIc.ByZILXQpb5OkwSjY6GfyV.sxrhXnIBZxMoc5w9qLky',
    'ADMIN',
    TRUE,
    TRUE
);

-- Tahun ajaran aktif awal.
INSERT IGNORE INTO tahun_ajaran (nama, aktif)
VALUES ('2026/2027', TRUE);

-- Kelas contoh untuk tahun ajaran awal.
INSERT INTO kelas (tahun_ajaran_id, nama_kelas, tingkat, jurusan, wali_kelas)
SELECT id, 'X IPA 1', 'X', 'IPA', 'Wali Kelas X IPA 1'
FROM tahun_ajaran ta
WHERE ta.nama = '2026/2027'
  AND NOT EXISTS (
      SELECT 1
      FROM kelas
      WHERE nama_kelas = 'X IPA 1'
        AND tahun_ajaran_id = ta.id
  );

INSERT INTO kelas (tahun_ajaran_id, nama_kelas, tingkat, jurusan, wali_kelas)
SELECT id, 'X IPS 1', 'X', 'IPS', 'Wali Kelas X IPS 1'
FROM tahun_ajaran ta
WHERE ta.nama = '2026/2027'
  AND NOT EXISTS (
      SELECT 1
      FROM kelas
      WHERE nama_kelas = 'X IPS 1'
        AND tahun_ajaran_id = ta.id
  );
