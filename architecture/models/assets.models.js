const db = require('../../database/db');

const fetchAssets = () => {
    return db.query('SELECT * FROM assets')
        .then(([rows]) => {
            return rows;
        });
};

const fetchAssetById = (asset_id) => {
    return db.query('SELECT * FROM assets WHERE asset_id = ?', [asset_id])
        .then(([rows]) => rows[0])
}

const addAsset = ({ asset_name, asset_type }) => {
    const queryValues = [ asset_name, asset_type ];
    
    const queryString = 
    `INSERT INTO assets
    (asset_name, asset_type)
    VALUES (?, ?)`;

    return db.query(queryString, queryValues)
        .then(([result]) => {
            return fetchAssetById(result.insertId)
        })
}

const updateAsset = ({ asset_id, asset_name, asset_type }) => {
    return db.query(
        `UPDATE assets
         SET asset_name = ?, asset_type = ?, updated_at = CURRENT_TIMESTAMP
         WHERE asset_id = ?`,
        [asset_name, asset_type, asset_id]
    )
    .then(() => {
        return db.query(
            `SELECT * FROM assets WHERE asset_id = ?`, [asset_id]
        )
    })
    .then(([rows]) => {
        return rows[0]
    })
};

const fetchVulnerabilitiesByAssetId = (asset_id) => {
    return db.query(
        `SELECT v.*
         FROM vulnerabilities v
         JOIN vulnerability_assets va
         ON v.vulnerability_id = va.vulnerability_id
         WHERE va.asset_id = ?`,
        [asset_id]
    )
    .then(([rows]) => rows);
};

const removeAsset = (asset_id) => {
    const queryString = 'DELETE FROM assets WHERE asset_id = ?';

    return db.query(queryString, [asset_id])
        .then(([result]) => {
            return result.affectedRows;
        })
}

module.exports = {
    fetchAssets,
    fetchAssetById,
    addAsset,
    updateAsset,
    fetchVulnerabilitiesByAssetId,
    removeAsset
};
