const authService = require("./auth.service");
const response = require("../../utils/response");

const register = async (req, res) => {
    try {
        const result = await authService.register(req.body);
        return response.success(res, result, "User registered successfully");
    } catch (error) {
        return response.error(res, error.message, 400);
    }
};

const login = async (req, res) => {
    try {
        const result = await authService.login(req.body);
        return response.success(res, result, "User logged in successfully");
    } catch (error) {
        return response.error(res, error.message, 400);
    }
}
module.exports = {
    register,
    login,
};