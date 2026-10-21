const {
    generateReportData,
    generateManagementReportData
} = require('../services/report-data-service');
const { generateReportPdf } = require('../services/report-document-service');

const getReport = (req, res, next, format) => {
    const { report_type } = req.params;
    const { period_start, period_end } = req.query;

    const reportDataPromise = report_type === 'management_summary'
        ? generateManagementReportData(period_start, period_end)
        : generateReportData(report_type, period_start, period_end);

    reportDataPromise
        .then((report) => {
            if (format === 'json') {
                return res.status(200).send({ report });
            }

            return generateReportPdf(report)
                .then((pdf) => {
                    const filename = [
                        report_type,
                        period_start,
                        period_end
                    ].join('-') + '.pdf';

                    res.status(200)
                        .type('application/pdf')
                        .set('Content-Disposition', `inline; filename="${filename}"`)
                        .send(pdf);
                });
        })
        .catch((err) => {
            if (err.statusCode === 400) {
                return res.status(400).send({ error: err.message });
            }

            next(err);
        });
};

const getReportData = (req, res, next) => getReport(req, res, next, 'json');
const getReportPdf = (req, res, next) => getReport(req, res, next, 'pdf');

module.exports = {
        getReportData,
        getReportPdf
};
