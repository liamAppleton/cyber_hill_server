const {
    fetchAuditLog,
    fetchAuditLogById
} = require('../models');

const getAuditLog = (req, res, next) => {
    fetchAuditLog()
        .then((audit_logs) => {
            res.status(200).send({ audit_logs })
        })
        .catch((err) => {
            next(err)
        })
};

const getAuditLogById = (req, res, next) => {
    const { audit_log_id } = req.params;

    fetchAuditLogById(audit_log_id)
        .then((log) => {
            res.status(200).send({ log })
        })
        .catch((err) => {
            next(err)
        })
}

module.exports = {
    getAuditLog,
    getAuditLogById
};