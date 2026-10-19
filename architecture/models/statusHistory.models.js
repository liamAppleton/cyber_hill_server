const db = require('../../database/db');

const fetchStatusHistory = () => {
    return db.query('SELECT * FROM status_history')
        .then(([rows]) => {
            return rows
        })
}

module.exports = {
    fetchStatusHistory
};