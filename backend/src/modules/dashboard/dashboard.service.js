const dashboardQuery = require("./dashboard.query");

const getStats = async () => {
    return await dashboardQuery.getStats();
};

module.exports = {
    getStats,
};
