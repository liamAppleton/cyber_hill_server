const db = require('../database/db');

const fetchUsers = () => {
    return db.query('SELECT * FROM users')
        .then(([users]) => users)
}

module.exports = {
    fetchUsers
}