const errorMiddleware = (err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);

  if (err.name === "ZodError") {
    return res.status(400).json({
      success: false,
      message: "Validasi gagal",
      errors: err.errors,
    });
  }

  const status = err.statusCode || (err.code === "ER_DUP_ENTRY" ? 409 : err.code === "ER_ROW_IS_REFERENCED_2" ? 409 : 500);
  res.status(status).json({
    success: false,
    message: status === 500 ? "Terjadi kesalahan pada server" : err.message || "Data konflik atau relasi masih digunakan",
  });
};

module.exports = errorMiddleware;
