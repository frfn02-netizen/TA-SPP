const validate = (schema) => {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error.name === "ZodError") {
        return res.status(400).json({
          success: false,
          message: "Validasi gagal",
          errors: error.issues ?? error.errors,
        });
      }
      next(error);
    }
  };
};

module.exports = validate;