const db = require('../../database/db');

const buildFilters = ({ record_type, record_id, action, from, to, user_id }, dateColumn = 'l.changed_at') => {
    const where = [];
    const values = [];
    if (record_type) { where.push('l.record_type = ?'); values.push(record_type); }
    if (record_id) { where.push('l.record_id = ?'); values.push(Number(record_id)); }
    if (action) { where.push('l.action = ?'); values.push(action); }
    if (user_id) { where.push('l.user_id = ?'); values.push(Number(user_id)); }
    if (from) { where.push(`${dateColumn} >= ?`); values.push(`${from} 00:00:00`); }
    if (to) { where.push(`${dateColumn} <= ?`); values.push(`${to} 23:59:59`); }
    return { clause: where.length ? `WHERE ${where.join(' AND ')}` : '', values };
};

const clampLimit = (limit) => Math.min(Math.max(Number(limit) || 200, 1), 1000);

const fetchAuditLog = (filters = {}) => {
    const { clause, values } = buildFilters(filters);
    return db.query(
        `SELECT l.*, u.username
         FROM audit_log l LEFT JOIN users u ON u.user_id = l.user_id
         ${clause}
         ORDER BY l.changed_at DESC, l.audit_log_id DESC
         LIMIT ${clampLimit(filters.limit)}`,
        values
    ).then(([rows]) => rows);
};

const fetchAuditLogById = (audit_log_id) => db.query(
    `SELECT l.*, u.username
     FROM audit_log l LEFT JOIN users u ON u.user_id = l.user_id
     WHERE l.audit_log_id = ?`,
    [audit_log_id]
).then(([rows]) => {
    if (!rows[0]) return Promise.reject({ status: 404, message: 'Audit log entry not found' });
    return rows[0];
});

module.exports = { fetchAuditLog, fetchAuditLogById, buildFilters, clampLimit };
