const db = require('./db.js');

const createUsers = (usersData) => {
    return db.query(`
        CREATE TABLE IF NOT EXISTS users (
            user_id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(100) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `).then(() => {
        return Promise.all(
            usersData.map(user => {
                return db.query(
                    `INSERT INTO users (username, password_hash)
                     VALUES (?, ?)`,
                    [user.username, user.password_hash]
                );
            })
        );
    });
};

const seed = ({usersData}) => {
   return db.query(`DROP TABLE IF EXISTS users;`)
    .then(() => createUsers(usersData))
}

module.exports = seed;