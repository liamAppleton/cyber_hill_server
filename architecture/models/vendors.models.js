const db = require('../../database/db');
const { removeRelationshipsForRecord } = require('./recordRelationships.models');

const criticalityLevels = ['low', 'medium', 'high', 'critical'];
const editableColumns = ['name', 'function', 'criticality', 'holds_pii', 'system_access', 'it_supplier'];

const badRequest = (message) => ({ status: 400, message });

// Aggregates each vendor's risks so the overall vendor status can be shown alongside them.
const vendorSelect = `
    SELECT v.*,
        (SELECT COUNT(*) FROM vendor_risks r WHERE r.vendor_id = v.vendor_id) AS total_risks,
        (SELECT COUNT(*) FROM vendor_risks r
          WHERE r.vendor_id = v.vendor_id AND r.status IN ('open', 'in_progress')) AS active_risks,
        (SELECT MAX(FIELD(r.risk_level, 'low', 'medium', 'high', 'critical')) FROM vendor_risks r
          WHERE r.vendor_id = v.vendor_id AND r.status IN ('open', 'in_progress')) AS highest_active_rank
    FROM vendors v`;

const withOverallStatus = (row) => {
    if (!row) return row;
    const { highest_active_rank, ...rest } = row;
    return {
        ...rest,
        highest_active_risk_level: highest_active_rank ? criticalityLevels[highest_active_rank - 1] : null
    };
};

const fetchVendors = () => {
    return db.query(`${vendorSelect} ORDER BY v.name`)
        .then(([rows]) => rows.map(withOverallStatus));
};

const fetchVendorById = (vendor_id) => {
    return db.query(`${vendorSelect} WHERE v.vendor_id = ?`, [vendor_id])
        .then(([rows]) => withOverallStatus(rows[0]));
};

const validateVendorFields = (fields, { requireAll }) => {
    if (requireAll) {
        if (typeof fields.name !== 'string' || !fields.name.trim()) return 'Vendor name is required.';
        if (typeof fields.function !== 'string' || !fields.function.trim()) return 'Vendor function is required.';
        if (fields.criticality === undefined) return 'Criticality is required.';
    }
    if (fields.name !== undefined && (typeof fields.name !== 'string' || !fields.name.trim())) {
        return 'Vendor name must not be empty.';
    }
    if (fields.function !== undefined && (typeof fields.function !== 'string' || !fields.function.trim())) {
        return 'Vendor function must not be empty.';
    }
    if (fields.criticality !== undefined && !criticalityLevels.includes(fields.criticality)) {
        return `Criticality must be one of: ${criticalityLevels.join(', ')}.`;
    }
    for (const flag of ['holds_pii', 'system_access', 'it_supplier']) {
        if (fields[flag] !== undefined && typeof fields[flag] !== 'boolean') {
            return `${flag} must be true or false.`;
        }
    }
    return null;
};

const addVendor = ({ name, function: vendorFunction, criticality, holds_pii, system_access, it_supplier }) => {
    const fields = { name, function: vendorFunction, criticality, holds_pii, system_access, it_supplier };
    const problem = validateVendorFields(fields, { requireAll: true });
    if (problem) return Promise.reject(badRequest(problem));

    return db.query(
        `INSERT INTO vendors (name, \`function\`, criticality, holds_pii, system_access, it_supplier)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [name.trim(), vendorFunction.trim(), criticality, Boolean(holds_pii), Boolean(system_access), Boolean(it_supplier)]
    ).then(([result]) => fetchVendorById(result.insertId));
};

const updateVendor = (vendor_id, updates = {}) => {
    const fields = Object.keys(updates).filter((field) => editableColumns.includes(field));
    if (fields.length === 0) return Promise.reject(badRequest('No valid fields provided to update.'));

    const problem = validateVendorFields(updates, { requireAll: false });
    if (problem) return Promise.reject(badRequest(problem));

    const values = fields.map((field) => (typeof updates[field] === 'string' ? updates[field].trim() : updates[field]));

    return db.query(
        `UPDATE vendors SET ${fields.map((field) => `\`${field}\` = ?`).join(', ')} WHERE vendor_id = ?`,
        [...values, vendor_id]
    ).then(([result]) => {
        if (result.affectedRows === 0) return Promise.reject({ status: 404, message: 'Vendor not found.' });
        return fetchVendorById(vendor_id);
    });
};

const removeVendor = (vendor_id) => {
    return db.query('SELECT vendor_risk_id FROM vendor_risks WHERE vendor_id = ?', [vendor_id])
        .then(([risks]) => db.query('DELETE FROM vendors WHERE vendor_id = ?', [vendor_id])
            .then(([result]) => {
                if (!result.affectedRows) return 0;
                return Promise.all([
                    removeRelationshipsForRecord('vendor', vendor_id),
                    ...risks.map((risk) => removeRelationshipsForRecord('vendor_risk', risk.vendor_risk_id))
                ]).then(() => result.affectedRows);
            }));
};

const fetchVendorRisksById = (vendor_id) => {
    return db.query(
        'SELECT * FROM vendor_risks WHERE vendor_id = ? ORDER BY date_identified DESC, vendor_risk_id DESC',
        [vendor_id]
    ).then(([rows]) => rows);
};

const fetchVendorNotesById = (vendor_id) => {
    return db.query(
        `SELECT n.*, u.username
         FROM vendor_notes n
         LEFT JOIN users u ON u.user_id = n.user_id
         WHERE n.vendor_id = ?
         ORDER BY n.created_at DESC, n.vendor_note_id DESC`,
        [vendor_id]
    ).then(([rows]) => rows);
};

const addVendorNote = ({ vendor_id, body, user_id }) => {
    return db.query(
        'INSERT INTO vendor_notes (vendor_id, body, user_id) VALUES (?, ?, ?)',
        [vendor_id, body, user_id]
    ).then(([result]) => db.query(
        `SELECT n.*, u.username
         FROM vendor_notes n
         LEFT JOIN users u ON u.user_id = n.user_id
         WHERE n.vendor_note_id = ?`,
        [result.insertId]
    )).then(([rows]) => rows[0]);
};

module.exports = {
    fetchVendors,
    fetchVendorById,
    addVendor,
    updateVendor,
    removeVendor,
    fetchVendorRisksById,
    fetchVendorNotesById,
    addVendorNote
};
