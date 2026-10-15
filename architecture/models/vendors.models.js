const db = require('../../database/db');

const fetchVendors = () => {
    return db.query('SELECT * FROM vendors')
        .then(([rows]) => {
            return rows;
        })
}

const fetchVendorById = (vendor_id) => {
    return db.query('SELECT * FROM vendors WHERE vendor_id = ?', [vendor_id])
        .then(([rows]) => {
            return rows[0]
        })
}

const addVendor = ({
    name,
    function: vendorFunction,
    criticality,
    holds_pii,
    system_access,
    it_supplier
}) => {
    const query = `
        INSERT INTO vendors (
            name,
            \`function\`,
            criticality,
            holds_pii,
            system_access,
            it_supplier
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    const queryValues = [
        name,
        vendorFunction,
        criticality,
        holds_pii,
        system_access,
        it_supplier
    ];

    return db.query(query, queryValues)
};

const updateVendor = (vendor_id, updates) => {
    console.log(updates)
    const allowedColumns = [
        'name',
        'function',
        'criticality',
        'holds_pii',
        'system_access',
        'it_supplier'
    ];

    const fields = Object.keys(updates)
        .filter(field => allowedColumns.includes(field));

    if (fields.length === 0) {
        return Promise.reject({
            status: 400,
            message: 'No valid fields provided to update'
        });
    }

    const setClause = fields
        .map(field => `\`${field}\` = ?`)
        .join(', ');

    const values = fields.map(field => updates[field]);
    values.push(vendor_id);

    const query = `
        UPDATE vendors
        SET ${setClause}
        WHERE vendor_id = ?
    `;

    return db.query(query, values)
        .then(([result]) => {
            if (result.affectedRows === 0) {
                return Promise.reject({
                    status: 404,
                    message: 'Vendor not found'
                });
            }

            return fetchVendorById(vendor_id);
        });
};

const removeVendor = (vendor_id) => {
    return db.query('DELETE FROM vendors WHERE vendor_id = ?', [vendor_id])
        .then(([result]) => {
            return result.affectedRows
        })
}

const fetchVendorRisksById = (vendor_id) => {
    return db.query('SELECT * FROM vendor_risks WHERE vendor_id = ?', [vendor_id])
        .then(([rows]) => {
            return rows
        })
}

const fetchVendorNotesById = (vendor_id) => {
    return db.query('SELECT * FROM vendor_notes WHERE vendor_id = ?', [vendor_id])
        .then(([rows]) => {
            return rows
        })
}

const addVendorNote = ({ vendor_id, body, user_id }) => {
    const queryValues = [ vendor_id, body, user_id ];

    const queryString = 
        `INSERT INTO vendor_notes
        (vendor_id, body, user_id)
        VALUES (?, ?, ?)`

    return db.query(queryString, queryValues)
        .then(([result]) => {
            return fetchVendorNotesById(vendor_id)
        })
}

module.exports = {
    fetchVendors,
    fetchVendorById,
    addVendor,
    updateVendor,
    removeVendor,
    fetchVendorRisksById,
    fetchVendorNotesById,
    addVendorNote
};