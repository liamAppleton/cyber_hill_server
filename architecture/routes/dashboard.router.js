const { getDashboard } = require('../controllers/dashboard.controllers');

const dashboardRouter = require('express').Router();

dashboardRouter.route('/:dashboard_type')
    .get(getDashboard);

module.exports = dashboardRouter;
