const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const morgan = require ("morgan")
const authRoutes = require ("./modules/auth/auth.routes")
const cookieParser = require ("cookie-parser")
const { success } = require("zod")


const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(cookieParser())
app.use(morgan("dev"));

// API
app.get("/", (req, res) => {
    res.json({
        success: true,
        message : "QRIS BE TESTING"
    })
})
app.use("/api/auth", authRoutes);

module.exports = app;
