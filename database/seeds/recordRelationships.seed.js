
const db = require('../db');

const createRecordRelationships = (recordRelationshipsData) => {
    return db.query(`
        CREATE TABLE IF NOT EXISTS record_relationships (
            record_relationship_id INT AUTO_INCREMENT PRIMARY KEY,
            source_record_type VARCHAR(50) NOT NULL,
            source_record_id INT NOT NULL,
            target_record_type VARCHAR(50) NOT NULL,
            target_record_id INT NOT NULL,
            relationship_type VARCHAR(100) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_by INT NOT NULL,
            FOREIGN KEY (created_by)
                REFERENCES users(user_id)
                ON DELETE CASCADE
        );
    `).then(() => {
        return Promise.all(
            recordRelationshipsData.map(relationship => {
                return db.query(
                    `INSERT INTO record_relationships (
                        source_record_type,
                        source_record_id,
                        target_record_type,
                        target_record_id,
                        relationship_type,
                        created_by
                    ) VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        relationship.source_record_type,
                        relationship.source_record_id,
                        relationship.target_record_type,
                        relationship.target_record_id,
                        relationship.relationship_type,
                        relationship.created_by
                    ]
                );
            })
        );
    });
};

module.exports = createRecordRelationships;
