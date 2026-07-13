const errorMiddleware = (err, req, res, next) => {
  console.error(err);
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: status === 500 ? "Terjadi kesalahan pada server" : err.message,
  });
};

module.exports = errorMiddleware;
