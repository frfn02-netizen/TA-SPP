const express = require("express");
const transaksiRoutes = require ("./modules/transaksi/transaksi.routes")
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const authRoutes = require("./modules/auth/auth.routes");
const siswaRoutes = require("./modules/siswa/siswa.routes");
const tagihanRoutes = require("./modules/tagihan/tagihan.routes");
const errorMiddleware = require("./middlewares/error.middleware");
const tahunAjaranRoutes = require("./modules/tahunAjaran/tahunAjaran.routes");
const kelasRoutes = require("./modules/kelas/kelas.routes");
const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/", (req, res) => res.json({ success: true, message: "SPP QRIS API" }));
app.use("/api/auth", authRoutes);
app.use("/api/siswa", siswaRoutes);
app.use("/api/tagihan", tagihanRoutes);
app.use("/api/tahun-ajaran", tahunAjaranRoutes);
app.use("/api/kelas", kelasRoutes);
app.use("/api/transaksi", transaksiRoutes)
app.use(errorMiddleware);

module.exports = app;
