const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(422).json({
      success: false,
      message: "Data tidak valid",
      errors: result.error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message })),
    });
  }
  req.body = result.data;
  next();
};

module.exports = validate;
