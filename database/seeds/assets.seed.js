const db = require('../db');

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

module.exports = createAssets;