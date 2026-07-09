const db = require("../../config/database");

const findByUsername = async (username) => {

    const [rows] = await db.execute(
        `
        SELECT *
        FROM users
        WHERE username = ?
        LIMIT 1
        `,
        [username]
    );

    return rows[0];
};

const createUser = async ({
    username,
    password,
    role,
}) => {

    const [result] = await db.execute(
        `
        INSERT INTO users
        (username,password,role)
        VALUES (?,?,?)
        `,
        [
            username,
            password,
            role,
        ]
    );

    return result.insertId;
};

module.exports = {
    findByUsername,
    createUser,
};