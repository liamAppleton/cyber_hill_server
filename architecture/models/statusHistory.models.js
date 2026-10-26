const db = require('../../database/db');
const { buildFilters, clampLimit } = require('./auditLogs.models');

const fetchStatusHistory = (filters = {}) => {
    const { clause, values } = buildFilters({ ...filters, action: undefined });
    return db.query(
        `SELECT l.*, u.username
         FROM status_history l LEFT JOIN users u ON u.user_id = l.user_id
         ${clause}
         ORDER BY l.changed_at DESC, l.status_history_id DESC
         LIMIT ${clampLimit(filters.limit)}`,
        values
    ).then(([rows]) => rows);
};

module.exports = { fetchStatusHistory };
