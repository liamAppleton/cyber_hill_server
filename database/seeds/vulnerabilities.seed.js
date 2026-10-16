const db = require('../db');

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


const createVulnerabilityAssets = (vulnerabilityAssetsData) => {
    return db.query(`
        CREATE TABLE IF NOT EXISTS vulnerability_assets (
            vulnerability_asset_id INT AUTO_INCREMENT PRIMARY KEY,

            vulnerability_id INT NOT NULL,
            asset_id INT NOT NULL,

            status ENUM(
                'Open',
                'In Progress',
                'Resolved',
                'Accepted Risk'
            ) NOT NULL DEFAULT 'Open',

            contextual_severity ENUM(
                'Info',
                'Low',
                'Medium',
                'High',
                'Critical',
                'Unknown'
            ) NOT NULL DEFAULT 'Unknown',

            date_first_detected DATETIME NOT NULL,
            date_last_detected DATETIME NOT NULL,
            resolved_at DATETIME,

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ON UPDATE CURRENT_TIMESTAMP,

            UNIQUE KEY unique_vulnerability_asset (
                vulnerability_id,
                asset_id
            ),

            FOREIGN KEY (vulnerability_id)
                REFERENCES vulnerabilities(vulnerability_id)
                ON DELETE CASCADE,

            FOREIGN KEY (asset_id)
                REFERENCES assets(asset_id)
                ON DELETE CASCADE
        );
    `).then(() => {
        return Promise.all(
            vulnerabilityAssetsData.map(vulnerabilityAsset => {
                return db.query(
                    `INSERT INTO vulnerability_assets (
                        vulnerability_id,
                        asset_id,
                        status,
                        contextual_severity,
                        date_first_detected,
                        date_last_detected,
                        resolved_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        vulnerabilityAsset.vulnerability_id,
                        vulnerabilityAsset.asset_id,
                        vulnerabilityAsset.status || 'Open',
                        vulnerabilityAsset.contextual_severity ?? null,
                        vulnerabilityAsset.date_first_detected,
                        vulnerabilityAsset.date_last_detected,
                        vulnerabilityAsset.resolved_at ?? null
                    ]
                );
            })
        );
    });
};


const createVulnerabilityImports = (vulnerabilityImportsData) => {
    return db.query(`
        CREATE TABLE IF NOT EXISTS vulnerability_imports (
            vulnerability_import_id INT AUTO_INCREMENT PRIMARY KEY,

            source VARCHAR(100) NOT NULL,
            imported_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            file_name VARCHAR(255) NOT NULL,

            import_status ENUM(
                'Pending',
                'In Progress',
                'Completed',
                'Completed with Errors',
                'Failed'
            ) NOT NULL DEFAULT 'Pending',

            metadata JSON,

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ON UPDATE CURRENT_TIMESTAMP
        );
    `).then(() => {
        return Promise.all(
            vulnerabilityImportsData.map(importRecord => {
                return db.query(
                    `INSERT INTO vulnerability_imports (
                        source,
                        imported_at,
                        file_name,
                        import_status,
                        metadata
                    ) VALUES (?, ?, ?, ?, ?)`,
                    [
                        importRecord.source,
                        importRecord.imported_at ?? null,
                        importRecord.file_name,
                        importRecord.import_status || 'Pending',
                        importRecord.metadata
                            ? JSON.stringify(importRecord.metadata)
                            : null
                    ]
                );
            })
        );
    });
};



const createVulnerabilityImportFindings = (
    vulnerabilityImportFindingsData
) => {
    return db.query(`
        CREATE TABLE IF NOT EXISTS vulnerability_import_findings (
            vulnerability_import_finding_id INT AUTO_INCREMENT PRIMARY KEY,

            vulnerability_import_id INT NOT NULL,
            asset_id INT NOT NULL,

            nvt_oid VARCHAR(100) NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT,

            scanner_severity ENUM(
                'Info',
                'Low',
                'Medium',
                'High',
                'Critical'
            ),

            cvss DECIMAL(3, 1),
            port INT NOT NULL DEFAULT 0,
            port_protocol VARCHAR(10) NOT NULL DEFAULT 'tcp',
            date_detected DATETIME NOT NULL,

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (vulnerability_import_id)
                REFERENCES vulnerability_imports(vulnerability_import_id)
                ON DELETE CASCADE,

            FOREIGN KEY (asset_id)
                REFERENCES assets(asset_id)
                ON DELETE CASCADE,

            UNIQUE KEY unique_import_finding (
                vulnerability_import_id,
                asset_id,
                nvt_oid,
                port,
                port_protocol
            )
        );
    `).then(() => {
        return Promise.all(
            vulnerabilityImportFindingsData.map(finding => {
                return db.query(
                    `INSERT INTO vulnerability_import_findings (
                        vulnerability_import_id,
                        asset_id,
                        nvt_oid,
                        title,
                        description,
                        scanner_severity,
                        cvss,
                        port,
                        port_protocol,
                        date_detected
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        finding.vulnerability_import_id,
                        finding.asset_id,
                        finding.nvt_oid,
                        finding.title,
                        finding.description,
                        finding.scanner_severity ?? null,
                        finding.cvss ?? null,
                        finding.port ?? 0,
                        finding.port_protocol ?? 'tcp',
                        finding.date_detected
                    ]
                );
            })
        );
    });
};

const createVulnerabilityNotes = (vulnerabilityNotesData) => {
    return db.query(`
        CREATE TABLE IF NOT EXISTS vulnerability_notes (
            vulnerability_note_id INT AUTO_INCREMENT PRIMARY KEY,

            vulnerability_id INT NOT NULL,
            body TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            user_id INT NOT NULL,

            FOREIGN KEY (vulnerability_id)
                REFERENCES vulnerabilities(vulnerability_id)
                ON DELETE CASCADE,

            FOREIGN KEY (user_id)
                REFERENCES users(user_id)
                ON DELETE CASCADE
        );
    `).then(() => {
        return Promise.all(
            vulnerabilityNotesData.map(note => {
                return db.query(
                    `INSERT INTO vulnerability_notes (
                        vulnerability_id,
                        body,
                        created_at,
                        user_id
                    ) VALUES (?, ?, ?, ?)`,
                    [
                        note.vulnerability_id,
                        note.body,
                        note.created_at ?? null,
                        note.user_id
                    ]
                );
            })
        );
    });
};


const createVulnerabilityAssetNotes = (vulnerabilityAssetNotesData) => {
    return db.query(`
        CREATE TABLE IF NOT EXISTS vulnerability_asset_notes (
            vulnerability_asset_note_id INT AUTO_INCREMENT PRIMARY KEY,

            vulnerability_asset_id INT NOT NULL,
            body TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            user_id INT NOT NULL,

            FOREIGN KEY (vulnerability_asset_id)
                REFERENCES vulnerability_assets(vulnerability_asset_id)
                ON DELETE CASCADE,

            FOREIGN KEY (user_id)
                REFERENCES users(user_id)
                ON DELETE CASCADE
        );
    `).then(() => {
        return Promise.all(
            vulnerabilityAssetNotesData.map(note => {
                return db.query(
                    `INSERT INTO vulnerability_asset_notes (
                        vulnerability_asset_id,
                        body,
                        created_at,
                        user_id
                    ) VALUES (?, ?, ?, ?)`,
                    [
                        note.vulnerability_asset_id,
                        note.body,
                        note.created_at ?? null,
                        note.user_id
                    ]
                );
            })
        );
    });
};


module.exports = {
    createVulnerabilities,
    createVulnerabilityAssets,
    createVulnerabilityImports,
    createVulnerabilityImportFindings,
    createVulnerabilityNotes,
    createVulnerabilityAssetNotes
}