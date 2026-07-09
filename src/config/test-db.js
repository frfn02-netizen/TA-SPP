const db = require("./database");

async function test() {
  try {
    const conn = await db.getConnection();
    console.log("✅ Database Connected");
    conn.release();
  } catch (err) {
    console.error(err);
  }
}

test();
