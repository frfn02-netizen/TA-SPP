const authService = require("./auth.service");
const response = require("../../utils/response");

const register = async (req, res, next) => {
    try {
        const result = await authService.register(req.body);
        return response.success(res, result, "User berhasil dibuat", 201);
    } catch (error) {
        return next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const result = await authService.login(req.body);
        return response.success(res, result, "Login berhasil");
    } catch (error) {
        return next(error);
    }
}
module.exports = {
    register,
    login,
};
