const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
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

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();

    } catch (err) {

        return res.status(401).json({

            success: false,

            message: "Token tidak valid"

        });

    }
};

module.exports = authMiddleware;
