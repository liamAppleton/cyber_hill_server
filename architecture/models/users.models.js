const db = require('../../database/db');

const fetchUsers = () => {
    return db.query('SELECT * FROM users')
        .then(([rows]) => rows)
}

module.exports = {
    fetchUsers
}