const db = require('./db.js');

const createUsers = (usersData) => {
    return db.query(`
        CREATE TABLE IF NOT EXISTS users (
            user_id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(100) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `).then(() => {
        return Promise.all(
            usersData.map(user => {
                return db.query(
                    `INSERT INTO users (username, password_hash)
                     VALUES (?, ?)`,
                    [user.username, user.password_hash]
                );
            })
        );
    });
};

const createAssets = (assetsData) => {
    return db.query(`
        CREATE TABLE IF NOT EXISTS assets (
            asset_id INT AUTO_INCREMENT PRIMARY KEY,
            asset_name VARCHAR(255) NOT NULL UNIQUE,
            asset_type VARCHAR(100) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ON UPDATE CURRENT_TIMESTAMP
        );
    `).then(() => {
        return Promise.all(
            assetsData.map(asset => {
                return db.query(
                    `INSERT INTO assets (asset_name, asset_type)
                     VALUES (?, ?)`,
                    [
                        asset.asset_name,
                        asset.asset_type
                    ]
                );
            })
        );
    });
};

const createVulnerabilities = (vulnerabilitiesData) => {
    return db.query(`
        CREATE TABLE IF NOT EXISTS vulnerabilities (
            vulnerability_id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            cve VARCHAR(20),
            cvss DECIMAL(3, 1),
            scanner_severity ENUM('Info', 'Low', 'Medium', 'High', 'Critical'),
            contextual_severity ENUM('Info', 'Low', 'Medium', 'High', 'Critical'),
            source VARCHAR(100),
            date_discovered DATETIME,
            status ENUM('Open', 'In Progress', 'Resolved', 'Accepted Risk')
                NOT NULL DEFAULT 'Open',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ON UPDATE CURRENT_TIMESTAMP,
            resolved_at DATETIME
        );
    `).then(() => {
        return Promise.all(
            vulnerabilitiesData.map(vulnerability => {
                return db.query(
                    `INSERT INTO vulnerabilities (
                        title,
                        description,
                        cve,
                        cvss,
                        scanner_severity,
                        contextual_severity,
                        source,
                        date_discovered,
                        status,
                        resolved_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        vulnerability.title,
                        vulnerability.description,
                        vulnerability.cve,
                        vulnerability.cvss,
                        vulnerability.scanner_severity,
                        vulnerability.contextual_severity,
                        vulnerability.source,
                        vulnerability.date_discovered,
                        vulnerability.status || 'Open',
                        vulnerability.resolved_at
                    ]
                );
            })
        );
    });
};

const seed = ({usersData, assetsData, vulnerabilitiesData}) => {
   return db.query(`DROP TABLE IF EXISTS users;`)
    .then(() => db.query(`DROP TABLE IF EXISTS assets`))
    .then(() => db.query(`DROP TABLE IF EXISTS vulnerabilities`))
    .then(() => createVulnerabilities(vulnerabilitiesData))
    .then(() => createAssets(assetsData))
    .then(() => createUsers(usersData))
}

module.exports = seed;