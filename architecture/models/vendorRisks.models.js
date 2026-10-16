const db = require('../../database/db');

const fetchVendorRisks = () => {
    return db.query('SELECT * FROM vendor_risks')
        .then(([rows]) => {
            return rows;
        })
};

const fetchVendorRiskById = (vendor_risk_id) => {
    return db.query('SELECT * FROM vendor_risks WHERE vendor_risk_id = ?', [vendor_risk_id])
        .then(([rows]) => {
            return rows[0]
        })
}

const addVendorRisk = ({ vendor_id, title, description, risk_level, status, date_identified }) => {
    const queryValues = [ vendor_id, title, description, risk_level, status, date_identified ];

    const queryString = `
    INSERT INTO vendor_risks
    (vendor_id, title, description, risk_level, status, date_identified)
    VALUES (?, ?, ?, ?, ?, ?)`

    return db.query(queryString, queryValues)
        .then(([result]) => {
            return fetchVendorRiskById(result.insertId)
        })
}

const updateVendorRisk = (vendor_risk_id, updates) => {
    const allowedFields = [
        'title',
        'description',
        'date_identified'
    ];

    const fields = [];
    const values = [];

    // Reject unexpected fields
    const invalidFields = Object.keys(updates)
        .filter((field) => !allowedFields.includes(field));

    if (invalidFields.length > 0) {
        return Promise.reject(
            new Error(
                `Invalid fields provided: ${invalidFields.join(', ')}`
            )
        );
    }

    // Validate title
    if (
        updates.title !== undefined &&
        (
            typeof updates.title !== 'string' ||
            updates.title.trim().length === 0
        )
    ) {
        return Promise.reject(
            new Error('Title must be a non-empty string')
        );
    }

    // Validate description
    if (
        updates.description !== undefined &&
        updates.description !== null &&
        typeof updates.description !== 'string'
    ) {
        return Promise.reject(
            new Error('Description must be a string or null')
        );
    }

    // Validate date_identified
    if (updates.date_identified !== undefined) {
        const date = updates.date_identified;

        if (
            typeof date !== 'string' ||
            !/^\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2}:\d{2})?$/.test(date) ||
            Number.isNaN(Date.parse(date))
        ) {
            return Promise.reject(
                new Error(
                    'date_identified must be a valid date in YYYY-MM-DD or YYYY-MM-DD HH:MM:SS format'
                )
            );
        }
    }

    // Build the update using approved column names only
    for (const field of allowedFields) {
        if (updates[field] !== undefined) {
            fields.push(`\`${field}\` = ?`);
            values.push(
                field === 'title'
                    ? updates[field].trim()
                    : updates[field]
            );
        }
    }

    if (fields.length === 0) {
        return Promise.reject(
            new Error('No valid fields provided to update')
        );
    }

    values.push(vendor_risk_id);

    const query = `
        UPDATE vendor_risks
        SET ${fields.join(', ')}
        WHERE vendor_risk_id = ?
    `;

    return db.query(query, values);
};

const updateVendorRiskStatus = (vendor_risk_id, status) => {
    return db.query(`
        UPDATE vendor_risks
        SET status = ?
        WHERE vendor_risk_id = ?`,
        [status, vendor_risk_id])
        .then(([rows]) => {
            return rows[0]
        })
}

const removeVendorRisk = (vendor_risk_id) => {
    return db.query('DELETE FROM vendor_risks WHERE vendor_risk_id = ?', [vendor_risk_id])
        .then(([result]) => {
            return result.affectedRows
        })
}

const fetchVendorRiskNotesById = (vendor_risk_id) => {
    return db.query('SELECT * FROM vendor_risk_notes WHERE vendor_risk_id = ?', [vendor_risk_id])
        .then(([rows]) => {
            return rows
        })
}

const addVendorRiskNote = (vendor_risk_id, body, user_id) => {
    const queryValues = [ vendor_risk_id, body, user_id]
    
    const queryString = `
    INSERT INTO vendor_risk_notes
    (vendor_risk_id, body, user_id)
    VALUES (?, ?, ?)`;

    return db.query(queryString, queryValues)
        .then(([result]) => {
            fetchVendorRiskNotesById(result.insertId)
        })
}

const fetchRelationshipsByVendorRiskId = (vendor_risk_id) => {
    const queryString = `
        SELECT * FROM record_relationships
        WHERE (
            source_record_type = 'vendor_risk'
            AND source_record_id = ?
        )
        OR (
            target_record_type = 'vendor_risk'
            AND target_record_id = ?
        )`;

    return db.query(queryString, [vendor_risk_id, vendor_risk_id])
        .then(([rows]) => {
            console.log(rows)
            return rows
        })
}

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