const db = require('../../database/db');
const { removeRelationshipsForRecord } = require('./recordRelationships.models');

const riskLevels = ['low', 'medium', 'high', 'critical'];
const riskStatuses = ['open', 'in_progress', 'resolved', 'accepted'];
const dateFormat = /^\d{4}-\d{2}-\d{2}$/;

const badRequest = (message) => ({ status: 400, message });

const isValidDate = (value) => typeof value === 'string'
    && dateFormat.test(value)
    && !Number.isNaN(Date.parse(value))
    && new Date(value).toISOString().slice(0, 10) === value;

const riskSelect = `
    SELECT r.*, v.name AS vendor_name
    FROM vendor_risks r
    LEFT JOIN vendors v ON v.vendor_id = r.vendor_id`;

const fetchVendorRisks = () => {
    return db.query(`${riskSelect} ORDER BY r.date_identified DESC, r.vendor_risk_id DESC`)
        .then(([rows]) => rows);
};

const fetchVendorRiskById = (vendor_risk_id) => {
    return db.query(`${riskSelect} WHERE r.vendor_risk_id = ?`, [vendor_risk_id])
        .then(([rows]) => rows[0]);
};

const addVendorRisk = ({ vendor_id, title, description, risk_level, status = 'open', date_identified }) => {
    if (!Number.isInteger(Number(vendor_id)) || Number(vendor_id) <= 0) {
        return Promise.reject(badRequest('A valid vendor_id is required.'));
    }
    if (typeof title !== 'string' || !title.trim()) return Promise.reject(badRequest('Risk title is required.'));
    if (!riskLevels.includes(risk_level)) {
        return Promise.reject(badRequest(`risk_level must be one of: ${riskLevels.join(', ')}.`));
    }
    if (!riskStatuses.includes(status)) {
        return Promise.reject(badRequest(`status must be one of: ${riskStatuses.join(', ')}.`));
    }
    const identified = date_identified || new Date().toISOString().slice(0, 10);
    if (!isValidDate(identified)) return Promise.reject(badRequest('date_identified must be a valid YYYY-MM-DD date.'));

    return db.query(
        `INSERT INTO vendor_risks
            (vendor_id, title, description, risk_level, status, date_identified, resolved_at)
         VALUES (?, ?, ?, ?, ?, ?, ${status === 'resolved' ? 'NOW()' : 'NULL'})`,
        [vendor_id, title.trim(), description || null, risk_level, status, identified]
    ).then(([result]) => fetchVendorRiskById(result.insertId));
};

const updateVendorRisk = (vendor_risk_id, updates = {}) => {
    const allowedFields = ['title', 'description', 'risk_level', 'date_identified'];
    const invalidFields = Object.keys(updates).filter((field) => !allowedFields.includes(field));
    if (invalidFields.length > 0) return Promise.reject(badRequest(`Invalid fields provided: ${invalidFields.join(', ')}.`));

    if (updates.title !== undefined && (typeof updates.title !== 'string' || !updates.title.trim())) {
        return Promise.reject(badRequest('Title must be a non-empty string.'));
    }
    if (updates.description !== undefined && updates.description !== null && typeof updates.description !== 'string') {
        return Promise.reject(badRequest('Description must be a string or null.'));
    }
    if (updates.risk_level !== undefined && !riskLevels.includes(updates.risk_level)) {
        return Promise.reject(badRequest(`risk_level must be one of: ${riskLevels.join(', ')}.`));
    }
    if (updates.date_identified !== undefined && !isValidDate(updates.date_identified)) {
        return Promise.reject(badRequest('date_identified must be a valid YYYY-MM-DD date.'));
    }

    const fields = allowedFields.filter((field) => updates[field] !== undefined);
    if (fields.length === 0) return Promise.reject(badRequest('No valid fields provided to update.'));

    const values = fields.map((field) => (field === 'title' ? updates[field].trim() : updates[field]));

    return db.query(
        `UPDATE vendor_risks SET ${fields.map((field) => `\`${field}\` = ?`).join(', ')} WHERE vendor_risk_id = ?`,
        [...values, vendor_risk_id]
    ).then(([result]) => {
        if (result.affectedRows === 0) return Promise.reject({ status: 404, message: 'Vendor risk not found.' });
        return fetchVendorRiskById(vendor_risk_id);
    });
};

const updateVendorRiskStatus = (vendor_risk_id, status) => {
    if (!riskStatuses.includes(status)) {
        return Promise.reject(badRequest(`status must be one of: ${riskStatuses.join(', ')}.`));
    }

    return db.query(
        `UPDATE vendor_risks
         SET status = ?,
             resolved_at = CASE
                 WHEN ? = 'resolved' THEN COALESCE(resolved_at, NOW())
                 ELSE NULL
             END
         WHERE vendor_risk_id = ?`,
        [status, status, vendor_risk_id]
    ).then(([result]) => {
        if (result.affectedRows === 0) return Promise.reject({ status: 404, message: 'Vendor risk not found.' });
        return fetchVendorRiskById(vendor_risk_id);
    });
};

const removeVendorRisk = (vendor_risk_id) => {
    return db.query('DELETE FROM vendor_risks WHERE vendor_risk_id = ?', [vendor_risk_id])
        .then(([result]) => {
            if (result.affectedRows) return removeRelationshipsForRecord('vendor_risk', vendor_risk_id).then(() => result.affectedRows);
            return result.affectedRows;
        });
};

const fetchVendorRiskNotesById = (vendor_risk_id) => {
    return db.query(
        `SELECT n.*, u.username
         FROM vendor_risk_notes n
         LEFT JOIN users u ON u.user_id = n.user_id
         WHERE n.vendor_risk_id = ?
         ORDER BY n.created_at DESC, n.vendor_risk_note_id DESC`,
        [vendor_risk_id]
    ).then(([rows]) => rows);
};

const addVendorRiskNote = (vendor_risk_id, body, user_id) => {
    return db.query(
        'INSERT INTO vendor_risk_notes (vendor_risk_id, body, user_id) VALUES (?, ?, ?)',
        [vendor_risk_id, body, user_id]
    ).then(([result]) => db.query(
        `SELECT n.*, u.username
         FROM vendor_risk_notes n
         LEFT JOIN users u ON u.user_id = n.user_id
         WHERE n.vendor_risk_note_id = ?`,
        [result.insertId]
    )).then(([rows]) => rows[0]);
};

const fetchRelationshipsByVendorRiskId = (vendor_risk_id) => {
    return db.query(
        `SELECT * FROM record_relationships
         WHERE (source_record_type = 'vendor_risk' AND source_record_id = ?)
            OR (target_record_type = 'vendor_risk' AND target_record_id = ?)`,
        [vendor_risk_id, vendor_risk_id]
    ).then(([rows]) => rows);
};

module.exports = {
    fetchVendorRisks,
    fetchVendorRiskById,
    addVendorRisk,
    updateVendorRisk,
    updateVendorRiskStatus,
    removeVendorRisk,
    fetchVendorRiskNotesById,
    addVendorRiskNote,
    fetchRelationshipsByVendorRiskId
};
