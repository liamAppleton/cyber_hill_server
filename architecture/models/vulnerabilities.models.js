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

module.exports = {
    fetchVulnerabilities,
    fetchVulnerabilityById,
    addVulnerability
};