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

const addAsset = ({ asset_name, asset_type, ip_address }) => {
    const queryValues = [ asset_name, asset_type, ip_address || null ];
    
    const queryString = 
    `INSERT INTO assets
    (asset_name, asset_type, ip_address)
    VALUES (?, ?, ?)`;

    return db.query(queryString, queryValues)
        .then(([result]) => {
            return fetchAssetById(result.insertId)
        })
}

const updateAsset = ({ asset_id, asset_name, asset_type, ip_address }) => {
    // Only fields present in the request are changed; an empty IP clears it.
    const fields = [];
    const values = [];

    if (asset_name !== undefined) {
        fields.push('asset_name = ?');
        values.push(asset_name);
    }
    if (asset_type !== undefined) {
        fields.push('asset_type = ?');
        values.push(asset_type);
    }
    if (ip_address !== undefined) {
        fields.push('ip_address = ?');
        values.push(ip_address || null);
    }
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(asset_id);

    return db.query(
        `UPDATE assets SET ${fields.join(', ')} WHERE asset_id = ?`,
        values
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
