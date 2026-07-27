const jwt = require("jsonwebtoken");
const db = require("../config/database");

const authMiddleware = async (req, res, next) => {
    let decoded;

    try {

        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Token tidak ditemukan"
            });
        }

        const [scheme, token] = authHeader.split(" ");
        if (scheme !== "Bearer" || !token) {
            return res.status(401).json({ success: false, message: "Format token tidak valid" });
        }

        decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

    } catch (err) {

        return res.status(401).json({

            success: false,

            message: "Token tidak valid"

        });

    }

    try {
        const [rows] = await db.execute(
            "SELECT id, username, role, is_active FROM users WHERE id = ? LIMIT 1",
            [decoded.id]
        );
        const user = rows[0];

        if (!user || !user.is_active) {
            return res.status(401).json({
                success: false,
                message: "Akun tidak aktif"
            });
        }

        req.user = { id: user.id, username: user.username, role: user.role };
        next();
    } catch (err) {
        next(err);
    }
};

module.exports = authMiddleware;
