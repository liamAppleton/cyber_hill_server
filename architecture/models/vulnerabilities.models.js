const db = require('../../database/db');

const fetchVulnerabilities = () => {
    return db.query('SELECT * FROM vulnerabilities')
        .then(([rows]) => rows)
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
        SET status = ?
        WHERE vulnerability_id = ?`,
        [status, vulnerability_id]
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

const removeVulnerability = (vulnerability_id) => {
    const queryString = 'DELETE FROM vulnerabilities WHERE vulnerability_id = ?';

    return db.query(queryString, [vulnerability_id])
        .then(([result]) => {
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
        INSERT INTO vulnerability_assets
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
    fetchRelationshipsByVulnerabilityId
};