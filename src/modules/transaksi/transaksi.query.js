const db = require("../../config/database");

const create = async ({
  tagihanId,
  orderId,
  grossAmount,
}) => {
  const [result] = await db.execute(
    `
    INSERT INTO transaksi
    (
      tagihan_id,
      order_id,
      gross_amount
    )
    VALUES (?, ?, ?)
  `,
    [
      tagihanId,
      orderId,
      grossAmount,
    ]
  );

  return result.insertId;
};

const findAll = async () => {
  const [rows] = await db.execute(`
    SELECT
      t.*,
      s.nama,
      tg.bulan,
      tg.tahun
    FROM transaksi t
    JOIN tagihan tg
      ON tg.id = t.tagihan_id
    JOIN siswa s
      ON s.id = tg.siswa_id
    ORDER BY t.created_at DESC
  `);

  return rows;
};

const findById = async (id) => {
  const [rows] = await db.execute(
    `
    SELECT *
    FROM transaksi
    WHERE id = ?
    LIMIT 1
  `,
    [id]
  );

  return rows[0];
};

const findByTagihanId = async (tagihanId) => {
  const [rows] = await db.execute(
    `
    SELECT *
    FROM transaksi
    WHERE tagihan_id = ?
    LIMIT 1
  `,
    [tagihanId]
  );

  return rows[0];
};

const findByOrderId = async (orderId) => {
  const [rows] = await db.execute(
    `
    SELECT *
    FROM transaksi
    WHERE order_id = ?
    LIMIT 1
  `,
    [orderId]
  );

  return rows[0];
};
const updatePayment = async ({
  id,
  snapToken,
  paymentUrl,
}) => {
  await db.execute(
    `
    UPDATE transaksi
    SET
      snap_token = ?,
      payment_url = ?
    WHERE id = ?
    `,
    [
      snapToken,
      paymentUrl,
      id,
    ]
  );
};

module.exports = {
  create,
  findAll,
  findById,
  findByTagihanId,
  findByOrderId,
  updatePayment,
};