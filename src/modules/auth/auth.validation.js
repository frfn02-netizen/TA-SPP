const { z } = require("zod");

const credentials = {
  username: z.string().trim().min(3).max(50),
  password: z.string().min(6).max(72),
};

// Pendaftaran publik tidak boleh membuat akun ADMIN.
const registerSchema = z.object(credentials);
const loginSchema = z.object(credentials);

module.exports = { registerSchema, loginSchema };
