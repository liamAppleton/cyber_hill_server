const db = require('../db');

const createUsers = (usersData) => {
    return db.query(`
        CREATE TABLE IF NOT EXISTS users (
            user_id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(100) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `).then(() => db.query(`
        CREATE TABLE IF NOT EXISTS user_sessions (
            session_id BIGINT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            token_hash CHAR(64) NOT NULL UNIQUE,
            expires_at DATETIME NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX user_sessions_user_id_idx (user_id),
            INDEX user_sessions_expires_at_idx (expires_at),
            FOREIGN KEY (user_id)
                REFERENCES users(user_id)
                ON DELETE CASCADE
        );
    `)).then(() => {
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

module.exports = createUsers;