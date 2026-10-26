const {
    getReportInputs,
    getSocScreenshot,
    putSocReport,
    putPhishingResults,
    putTicketMonth
} = require('../controllers/reportInputs.controllers');

const reportInputsRouter = require('express').Router();

reportInputsRouter.route('/')
    .get(getReportInputs);

reportInputsRouter.route('/soc')
    .put(putSocReport);

reportInputsRouter.route('/soc/screenshot')
    .get(getSocScreenshot);

reportInputsRouter.route('/phishing')
    .put(putPhishingResults);

reportInputsRouter.route('/tickets')
    .put(putTicketMonth);

module.exports = reportInputsRouter;
