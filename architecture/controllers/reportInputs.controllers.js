const multer = require('multer');
const {
    fetchReportInputs,
    fetchSocScreenshot,
    saveSocReport,
    savePhishingResults,
    saveTicketMonth
} = require('../models/reportInputs.models');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 10 }
}).single('screenshot');

const handleError = (res, next) => (err) => {
    if (err && err.status) return res.status(err.status).send({ error: err.message });
    return next(err);
};

const getReportInputs = (req, res, next) => {
    fetchReportInputs(req.query.period_start, req.query.period_end)
        .then((inputs) => res.status(200).send({ inputs }))
        .catch(handleError(res, next));
};

const getSocScreenshot = (req, res, next) => {
    fetchSocScreenshot(req.query.period_start, req.query.period_end)
        .then((image) => {
            if (!image) return res.status(404).send({ error: 'No screenshot saved for this period.' });
            return res.status(200).type('image/png').set('Cache-Control', 'private, no-cache').send(image);
        })
        .catch(handleError(res, next));
};

const putSocReport = (req, res, next) => {
    upload(req, res, (uploadError) => {
        if (uploadError) {
            const message = uploadError.code === 'LIMIT_FILE_SIZE'
                ? 'The screenshot must be 5 MB or smaller.'
                : 'The screenshot upload was not valid.';
            return res.status(400).send({ error: message });
        }
        const { period_start, period_end, summary, remove_screenshot } = req.body || {};
        return saveSocReport({
            period_start,
            period_end,
            summary,
            screenshot: req.file ? req.file.buffer : null,
            remove_screenshot: remove_screenshot === 'true',
            user_id: req.user.user_id
        })
            .then((soc) => res.status(200).send({ soc }))
            .catch(handleError(res, next));
    });
};

const putPhishingResults = (req, res, next) => {
    const { period_start, period_end, campaigns } = req.body || {};
    savePhishingResults({ period_start, period_end, campaigns, user_id: req.user.user_id })
        .then((count) => res.status(200).send({ saved: count }))
        .catch(handleError(res, next));
};

const putTicketMonth = (req, res, next) => {
    const { month, total_opened, categories } = req.body || {};
    saveTicketMonth({ month, total_opened, categories, user_id: req.user.user_id })
        .then((ticket_month) => res.status(200).send({ ticket_month }))
        .catch(handleError(res, next));
};

module.exports = {
    getReportInputs,
    getSocScreenshot,
    putSocReport,
    putPhishingResults,
    putTicketMonth
};
