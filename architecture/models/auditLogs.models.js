const db = require('../../database/db');

const fetchAuditLog = () => {
    return db.query('SELECT * FROM audit_log')
        .then(([rows]) => {
            return rows
        })
}

const fetchAuditLogById = (audit_log_id) => {
    return db.query('SELECT * FROM audit_log WHERE audit_log_id = ?', [audit_log_id])
        .then(([rows]) => {
            return rows[0]
        })
}

module.exports = {
    fetchAuditLog,
    fetchAuditLogById
};