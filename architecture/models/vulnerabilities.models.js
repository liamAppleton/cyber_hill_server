const db = require('../../database/db');
const { removeRelationshipsForRecord } = require('./recordRelationships.models');

const fetchVulnerabilities = () => {
    return db.query(`
        SELECT v.*,
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
        `SELECT * FROM vulnerabilities WHERE vulnerability_id = ?`, [id]
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

const updateVulnerabilityById = ({ contextual_severity, vulnerability_id }) => {
    return db.query(
        `UPDATE vulnerabilities
        SET contextual_severity = ?
        WHERE vulnerability_id = ?`,
        [contextual_severity, vulnerability_id]
    )
    .then(() => {
        return db.query(
            `SELECT * FROM vulnerabilities
            WHERE vulnerability_id = ?`,
            [vulnerability_id]
        )
    })
    .then(([rows]) => {
        return rows[0]
    })
}

const updateVulnerabilityStatusById = ({ status, vulnerability_id }) => {
    return db.query(
        `UPDATE vulnerabilities
        SET status = ?,
            resolved_at = CASE
                WHEN ? = 'Resolved' THEN COALESCE(resolved_at, CURRENT_TIMESTAMP)
                ELSE NULL
            END
        WHERE vulnerability_id = ?`,
        [status, status, vulnerability_id]
    )
    .then(() => {
        return db.query(
            `SELECT * FROM vulnerabilities
            WHERE vulnerability_id = ?`,
            [vulnerability_id]
        )
    })
    .then(([rows]) => {
        return rows[0]
    })
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