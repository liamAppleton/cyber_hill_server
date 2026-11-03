const db = require('../../database/db');
const { removeRelationshipsForRecord } = require('./recordRelationships.models');

const STATUSES = ['Open', 'In Progress', 'Resolved', 'Accepted Risk'];
const SEVERITIES = ['Info', 'Low', 'Medium', 'High', 'Critical'];
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const badRequest = (message) => Promise.reject({ status: 400, message });

const isValidDate = (value) => {
    if (typeof value !== 'string' || !DATE_PATTERN.test(value)) return false;
    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

const fetchVulnerabilities = () => {
    return db.query(`
        SELECT v.*,
            DATE_FORMAT(v.resolved_at, '%Y-%m-%d') AS resolved_at,
            COALESCE(v.contextual_severity, v.scanner_severity) AS effective_severity,
            (SELECT COUNT(*) FROM vulnerability_assets va WHERE va.vulnerability_id = v.vulnerability_id) AS asset_count,
            (SELECT GROUP_CONCAT(CONCAT(a.asset_name, ' ', COALESCE(a.ip_address, '')) SEPARATOR ' ')
                FROM vulnerability_assets va JOIN assets a ON a.asset_id = va.asset_id
                WHERE va.vulnerability_id = v.vulnerability_id) AS asset_search
        FROM vulnerabilities v
        ORDER BY v.vulnerability_id DESC
    `).then(([rows]) => rows)
};

const fetchVulnerabilityById = (id) => {
    return db.query(
        `SELECT v.*, DATE_FORMAT(v.resolved_at, '%Y-%m-%d') AS resolved_at
         FROM vulnerabilities v
         WHERE v.vulnerability_id = ?`, [id]
    )
    .then(([rows]) => rows[0])
}

const addVulnerability = ({ title, description, cve, cvss, contextual_severity, source, date_discovered, status}) => {
    const queryValues = [
        title,
        description,
        cve,
        cvss,
        contextual_severity,
        source,
        date_discovered,
        status
    ];

    const queryString = 
        `INSERT INTO vulnerabilities
        (title, description, cve, cvss, contextual_severity, source, date_discovered, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    return db.query(queryString, queryValues)
        .then(([result]) => {
            return fetchVulnerabilityById(result.insertId)
        })
}

const updateVulnerabilityById = ({ vulnerability_id, ...updates }) => {
    const allowedFields = ['title', 'contextual_severity'];
    const invalidFields = Object.keys(updates).filter((field) => !allowedFields.includes(field));
    if (invalidFields.length > 0) return badRequest(`Invalid fields provided: ${invalidFields.join(', ')}`);
    if (Object.keys(updates).length === 0) return badRequest('No valid fields provided to update.');
    if (updates.title !== undefined && (
        typeof updates.title !== 'string'
        || updates.title.trim().length === 0
        || updates.title.trim().length > 255
    )) {
        return badRequest('Title is required (max 255 characters).');
    }
    if (
        updates.contextual_severity !== undefined
        && updates.contextual_severity !== null
        && !SEVERITIES.includes(updates.contextual_severity)
    ) {
        return badRequest(`Contextual severity must be one of: ${SEVERITIES.join(', ')}.`);
    }

    const fields = [];
    const values = [];
    for (const field of allowedFields) {
        if (updates[field] !== undefined) {
            fields.push(`\`${field}\` = ?`);
            values.push(field === 'title' ? updates.title.trim() : updates[field]);
        }
    }

    return db.query(
        `UPDATE vulnerabilities SET ${fields.join(', ')} WHERE vulnerability_id = ?`,
        [...values, vulnerability_id]
    ).then(() => fetchVulnerabilityById(vulnerability_id));
}

const updateVulnerabilityStatusById = ({ status, resolved_at, vulnerability_id }) => {
    if (!STATUSES.includes(status)) return badRequest(`Status must be one of: ${STATUSES.join(', ')}.`);
    if (resolved_at !== undefined && resolved_at !== null && !isValidDate(resolved_at)) {
        return badRequest('resolved_at must be a valid date in YYYY-MM-DD format.');
    }
    if (resolved_at !== undefined && status !== 'Resolved') {
        return badRequest('resolved_at can only be set when status is Resolved.');
    }

    let resolvedAtUpdate;
    let values;
    if (status !== 'Resolved') {
        resolvedAtUpdate = 'NULL';
        values = [status, vulnerability_id];
    } else if (resolved_at !== undefined) {
        resolvedAtUpdate = '?';
        values = [status, resolved_at, vulnerability_id];
    } else {
        resolvedAtUpdate = 'COALESCE(resolved_at, CURRENT_TIMESTAMP)';
        values = [status, vulnerability_id];
    }

    return db.query(
        `UPDATE vulnerabilities
         SET status = ?, resolved_at = ${resolvedAtUpdate}
         WHERE vulnerability_id = ?`,
        values
    ).then(() => fetchVulnerabilityById(vulnerability_id));
}

const fetchNotesByVulnerabilityId = (vulnerability_id) => {
    return db.query(
        `SELECT n.*, u.username
         FROM vulnerability_notes n
         LEFT JOIN users u ON u.user_id = n.user_id
         WHERE n.vulnerability_id = ?
         ORDER BY n.created_at DESC, n.vulnerability_note_id DESC`,
        [vulnerability_id]
    ).then(([rows]) => rows);
};

const addNoteToVulnerability = ({ vulnerability_id, body, user_id }) => {
    return db.query(
        `INSERT INTO vulnerability_notes (vulnerability_id, body, user_id)
         VALUES (?, ?, ?)`,
        [vulnerability_id, body, user_id]
    )
    .then(([result]) => db.query(
        `SELECT n.*, u.username
         FROM vulnerability_notes n
         LEFT JOIN users u ON u.user_id = n.user_id
         WHERE n.vulnerability_note_id = ?`,
        [result.insertId]
    ))
    .then(([rows]) => rows[0]);
};

const removeVulnerability = (vulnerability_id) => {
    const queryString = 'DELETE FROM vulnerabilities WHERE vulnerability_id = ?';

    return db.query(queryString, [vulnerability_id])
        .then(([result]) => {
            if (result.affectedRows) return removeRelationshipsForRecord('vulnerability', vulnerability_id).then(() => result.affectedRows);
            return result.affectedRows
        })
}

const fetchAssetsByVulnerabilityId = (vulnerability_id) => {
    const queryString = 'SELECT * FROM vulnerability_assets WHERE vulnerability_id = ?';

    return db.query(queryString, [vulnerability_id])
        .then(([rows]) => {
            return rows;
        })
}



const addAssetsByVulnerabilityId = (vulnerability_id, asset_ids) => {
    const queryString = `
        INSERT IGNORE INTO vulnerability_assets
            (
                vulnerability_id,
                asset_id,
                status,
                contextual_severity,
                date_first_detected,
                date_last_detected
            )
        VALUES ?
    `;

    const detectedAt = new Date();

    const values = asset_ids.map((asset_id) => [
        vulnerability_id,
        asset_id,
        'Open',
        'Unknown',
        detectedAt,
        detectedAt
    ]);

    return db.query(queryString, [values]);
};


const fetchRelationshipsByVulnerabilityId = (vulnerability_id) => {
    const queryString = `
        SELECT *
        FROM record_relationships
        WHERE (
            source_record_type = 'vulnerability'
            AND source_record_id = ?
        )
        OR (
            target_record_type = 'vulnerability'
            AND target_record_id = ?
        )
    `;

    return db.query(queryString, [
        vulnerability_id,
        vulnerability_id
    ])
        .then(([rows]) => {
            return rows;
        });
};



module.exports = {
    fetchVulnerabilities,
    fetchVulnerabilityById,
    addVulnerability,
    updateVulnerabilityById,
    updateVulnerabilityStatusById,
    removeVulnerability,
    fetchAssetsByVulnerabilityId,
    addAssetsByVulnerabilityId,
    fetchRelationshipsByVulnerabilityId,
    fetchNotesByVulnerabilityId,
    addNoteToVulnerability
};