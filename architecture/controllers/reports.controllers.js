const sharp = require('sharp');
const reportDataService = require('../services/report-data-service');
const reportInputsModels = require('../models/reportInputs.models');
const { DOCUMENT_TYPES } = require('../services/report-sections-service');
const { generateReportPdf } = require('../services/report-document-service');
const { generateReportDocx } = require('../services/report-docx-service');

const MAX_TITLE = 200;
const MAX_NARRATIVE = 5000;

const badRequest = (message) => Object.assign(new Error(message), { status: 400 });

const readParams = (req) => ({ ...req.query, ...(req.body && typeof req.body === 'object' ? req.body : {}) });

const loadReport = async (req, { forDocument }) => {
    const reportType = req.params.report_type;
    const params = readParams(req);

    if (forDocument && !DOCUMENT_TYPES.includes(reportType)) {
        throw badRequest(`Unsupported report type: ${reportType}`);
    }

    const report = reportType === 'management_summary'
        ? await reportDataService.generateManagementReportData(params.period_start, params.period_end)
        : await reportDataService.generateReportData(reportType, params.period_start, params.period_end);

    if (params.title !== undefined && params.title !== null && params.title !== '') {
        if (typeof params.title !== 'string' || params.title.length > MAX_TITLE) {
            throw badRequest(`title must be text of at most ${MAX_TITLE} characters.`);
        }
        report.title = params.title.trim();
    }
    if (params.narrative !== undefined && params.narrative !== null && params.narrative !== '') {
        if (typeof params.narrative !== 'string' || params.narrative.length > MAX_NARRATIVE) {
            throw badRequest(`narrative must be text of at most ${MAX_NARRATIVE} characters.`);
        }
        report.manual_narrative = params.narrative.trim();
    }

    if (forDocument && reportType === 'management_summary') {
        const inputs = await reportInputsModels.fetchReportInputs(params.period_start, params.period_end);
        if (inputs.soc) {
            const buffer = await reportInputsModels.fetchSocScreenshot(params.period_start, params.period_end);
            if (buffer) {
                const { width, height } = await sharp(buffer).metadata();
                inputs.soc.screenshot = { data: buffer, width, height };
            }
        }
        report.inputs = inputs;
    }
    return report;
};

const handleError = (res, next) => (err) => {
    const status = err && (err.status || err.statusCode);
    if (status) return res.status(status).send({ error: err.message });
    return next(err);
};

const getReportData = (req, res, next) => {
    loadReport(req, { forDocument: false })
        .then((report) => res.status(200).send({ report }))
        .catch(handleError(res, next));
};

const sendDocument = (generate, contentType, extension) => (req, res, next) => {
    loadReport(req, { forDocument: true })
        .then(async (report) => {
            const file = await generate(report);
            const { period_start: start, period_end: end } = report.metadata;
            res.status(200)
                .set({
                    'Content-Type': contentType,
                    'Content-Disposition': `inline; filename="${req.params.report_type}-${start}-to-${end}.${extension}"`
                })
                .send(file);
        })
        .catch(handleError(res, next));
};

const getReportPdf = sendDocument(generateReportPdf, 'application/pdf', 'pdf');
const getReportDocx = sendDocument(
    generateReportDocx,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'docx'
);

module.exports = { getReportData, getReportPdf, getReportDocx };
