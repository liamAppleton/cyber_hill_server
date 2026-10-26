const { fetchAuditLog, fetchAuditLogById } = require('../models');

const handleError = (res, next) => (err) => {
    if (err && err.status) return res.status(err.status).send({ error: err.message });
    return next(err);
};

const getAuditLog = (req, res, next) => {
    fetchAuditLog(req.query)
        .then((audit_logs) => res.status(200).send({ audit_logs }))
        .catch(handleError(res, next));
};

const getAuditLogById = (req, res, next) => {
    fetchAuditLogById(req.params.audit_log_id)
        .then((log) => res.status(200).send({ log }))
        .catch(handleError(res, next));
};

module.exports = { getAuditLog, getAuditLogById };
