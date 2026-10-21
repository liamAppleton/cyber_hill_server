const {
    getReportData,
    getReportPdf
} = require('../controllers/reports.controllers');

const reportsRouter = require('express').Router();

reportsRouter.route('/:report_type/data')
    .get(getReportData);

reportsRouter.route('/:report_type/pdf')
    .get(getReportPdf);

module.exports = reportsRouter;
