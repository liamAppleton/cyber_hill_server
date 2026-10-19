const {
    getAuditLog,
    getAuditLogById
} = require('../controllers');

const auditLogRouter = require('express').Router();

auditLogRouter.route('/')
    .get(getAuditLog)

auditLogRouter.route('/:audit_log_id')
    .get(getAuditLogById)

module.exports = auditLogRouter;
