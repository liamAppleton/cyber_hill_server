
const db = require('../db');

const createAuditLog = (auditLogData) => {
    return db.query(`
        CREATE TABLE IF NOT EXISTS audit_log (
            audit_log_id INT AUTO_INCREMENT PRIMARY KEY,
            record_type VARCHAR(50) NOT NULL,
            record_id INT NOT NULL,
            action VARCHAR(100) NOT NULL,
            changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            user_id INT NOT NULL,
            change_details TEXT,
            FOREIGN KEY (user_id)
                REFERENCES users(user_id)
                ON DELETE CASCADE
        );
    `).then(() => {
        return Promise.all(
            auditLogData.map(entry => {
                return db.query(
                    `INSERT INTO audit_log (
                        record_type,
                        record_id,
                        action,
                        changed_at,
                        user_id,
                        change_details
                    ) VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        entry.record_type,
                        entry.record_id,
                        entry.action,
                        entry.changed_at,
                        entry.user_id,
                        entry.change_details
                    ]
                );
            })
        );
    });
};

module.exports = createAuditLog;
