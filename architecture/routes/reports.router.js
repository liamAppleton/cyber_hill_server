const {
    getReportData,
    getReportPdf,
    getReportDocx
} = require('../controllers/reports.controllers');

const reportsRouter = require('express').Router();

reportsRouter.route('/:report_type/data')
    .get(getReportData)
    .post(getReportData);

reportsRouter.route('/:report_type/pdf')
    .get(getReportPdf)
    .post(getReportPdf);

reportsRouter.route('/:report_type/docx')
    .get(getReportDocx)
    .post(getReportDocx);

module.exports = reportsRouter;
