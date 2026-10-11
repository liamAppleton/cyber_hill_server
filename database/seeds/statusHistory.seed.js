

const db = require('../db');

const createStatusHistory = (statusHistoryData) => {
    return db.query(`
        CREATE TABLE IF NOT EXISTS status_history (
            status_history_id INT AUTO_INCREMENT PRIMARY KEY,
            record_type VARCHAR(50) NOT NULL,
            record_id INT NOT NULL,
            previous_status VARCHAR(50),
            new_status VARCHAR(50) NOT NULL,
            changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            user_id INT NOT NULL,
            reason TEXT,
            FOREIGN KEY (user_id)
                REFERENCES users(user_id)
                ON DELETE CASCADE
        );
    `).then(() => {
        return Promise.all(
            statusHistoryData.map(entry => {
                return db.query(
                    `INSERT INTO status_history (
                        record_type,
                        record_id,
                        previous_status,
                        new_status,
                        changed_at,
                        user_id,
                        reason
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        entry.record_type,
                        entry.record_id,
                        entry.previous_status,
                        entry.new_status,
                        entry.changed_at,
                        entry.user_id,
                        entry.reason
                    ]
                );
            })
        );
    });
};

module.exports = createStatusHistory;
