const dashboardService = require("./dashboard.service");
const response = require("../../utils/response");

const getStats = async (req, res, next) => {
    try {
        const result = await dashboardService.getStats();
        response.success(res, result);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getStats,
};
