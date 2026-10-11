
const db = require('../db');

const createVendors = (vendorsData) => {
    return db.query(`
        CREATE TABLE IF NOT EXISTS vendors (
            vendor_id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE,
            \`function\` VARCHAR(255) NOT NULL,
            criticality ENUM('low', 'medium', 'high', 'critical') NOT NULL,
            holds_pii BOOLEAN NOT NULL DEFAULT FALSE,
            system_access BOOLEAN NOT NULL DEFAULT FALSE,
            it_supplier BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ON UPDATE CURRENT_TIMESTAMP
        );
    `).then(() => {
        return Promise.all(
            vendorsData.map(vendor => {
                return db.query(
                    `INSERT INTO vendors (
                        name,
                        \`function\`,
                        criticality,
                        holds_pii,
                        system_access,
                        it_supplier
                    ) VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        vendor.name,
                        vendor.function,
                        vendor.criticality,
                        vendor.holds_pii,
                        vendor.system_access,
                        vendor.it_supplier
                    ]
                );
            })
        );
    });
};

const createVendorNotes = (vendorNotesData) => {
    return db.query(`
        CREATE TABLE IF NOT EXISTS vendor_notes (
            vendor_note_id INT AUTO_INCREMENT PRIMARY KEY,
            vendor_id INT NOT NULL,
            body TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            user_id INT NOT NULL,
            FOREIGN KEY (vendor_id) REFERENCES vendors(vendor_id)
                ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(user_id)
                ON DELETE CASCADE
        );
    `).then(() => {
        return Promise.all(
            vendorNotesData.map(note => {
                return db.query(
                    `INSERT INTO vendor_notes (
                        vendor_id,
                        body,
                        user_id
                    ) VALUES (?, ?, ?)`,
                    [
                        note.vendor_id,
                        note.body,
                        note.user_id
                    ]
                );
            })
        );
    });
};

const createVendorRisks = (vendorRisksData) => {
    return db.query(`
        CREATE TABLE IF NOT EXISTS vendor_risks (
            vendor_risk_id INT AUTO_INCREMENT PRIMARY KEY,
            vendor_id INT NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            risk_level ENUM('low', 'medium', 'high', 'critical') NOT NULL,
            status ENUM('open', 'in_progress', 'resolved', 'accepted') NOT NULL DEFAULT 'open',
            date_identified DATE NOT NULL,
            last_reviewed_at TIMESTAMP NULL DEFAULT NULL,
            resolved_at TIMESTAMP NULL DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (vendor_id) REFERENCES vendors(vendor_id)
                ON DELETE CASCADE
        );
    `).then(() => {
        return Promise.all(
            vendorRisksData.map(risk => {
                return db.query(
                    `INSERT INTO vendor_risks (
                        vendor_id,
                        title,
                        description,
                        risk_level,
                        status,
                        date_identified,
                        last_reviewed_at,
                        resolved_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        risk.vendor_id,
                        risk.title,
                        risk.description,
                        risk.risk_level,
                        risk.status,
                        risk.date_identified,
                        risk.last_reviewed_at,
                        risk.resolved_at
                    ]
                );
            })
        );
    });
};

const createVendorRiskNotes = (vendorRiskNotesData) => {
    return db.query(`
        CREATE TABLE IF NOT EXISTS vendor_risk_notes (
            vendor_risk_note_id INT AUTO_INCREMENT PRIMARY KEY,
            vendor_risk_id INT NOT NULL,
            body TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            user_id INT NOT NULL,
            FOREIGN KEY (vendor_risk_id)
                REFERENCES vendor_risks(vendor_risk_id)
                ON DELETE CASCADE,
            FOREIGN KEY (user_id)
                REFERENCES users(user_id)
                ON DELETE CASCADE
        );
    `).then(() => {
        return Promise.all(
            vendorRiskNotesData.map(note => {
                return db.query(
                    `INSERT INTO vendor_risk_notes (
                        vendor_risk_id,
                        body,
                        user_id
                    ) VALUES (?, ?, ?)`,
                    [
                        note.vendor_risk_id,
                        note.body,
                        note.user_id
                    ]
                );
            })
        );
    });
};

module.exports = {
    createVendors,
    createVendorNotes,
    createVendorRisks,
    createVendorRiskNotes
};
