require("dotenv").config();

const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

const run = async () => {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        multipleStatements: true,
    });

    try {
        const schema = fs.readFileSync(
            path.join(__dirname, "..", "database", "schema.sql"),
            "utf8"
        );

        const seed = fs.readFileSync(
            path.join(__dirname, "..", "database", "seed.sql"),
            "utf8"
        );

        await conn.query(schema);
        console.log("Schema applied.");

        await conn.query(seed);
        console.log("Seed applied.");
    } finally {
        await conn.end();
    }
};

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
