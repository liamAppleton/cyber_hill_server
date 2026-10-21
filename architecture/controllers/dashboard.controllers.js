const { getDashboardData } = require('../services/dashboard-data-service');

const getDashboard = (req, res, next) => {
    const { dashboard_type } = req.params;
    const { period_start, period_end } = req.query;

    getDashboardData(dashboard_type, period_start, period_end)
        .then((dashboard) => {
            res.status(200).send({ dashboard });
        })
        .catch((err) => {
            if (err.statusCode === 400) {
                return res.status(400).send({ error: err.message });
            }

            next(err);
        });
};

module.exports = {
    getDashboard
};
