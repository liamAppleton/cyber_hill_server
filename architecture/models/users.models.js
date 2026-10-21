const db = require('../../database/db');

const fetchUsers = () => {
    return db.query(`
        SELECT user_id, username, created_at
        FROM users
        ORDER BY user_id ASC
    `)
        .then(([rows]) => rows);
};

const fetchUserById = (userId) => {
    return db.query(`
        SELECT user_id, username, created_at
        FROM users
        WHERE user_id = ?
    `, [userId]).then(([rows]) => rows[0] || null);
};

const fetchUserByUsername = (username) => {
    return db.query(`
        SELECT user_id, username, password_hash, created_at
        FROM users
        WHERE username = ?
    `, [username]).then(([rows]) => rows[0] || null);
};

const fetchUserCredentialsById = (userId) => {
    return db.query(`
        SELECT user_id, username, password_hash, created_at
        FROM users
        WHERE user_id = ?
    `, [userId]).then(([rows]) => rows[0] || null);
};

const createUser = (username, passwordHash) => {
    return db.query(`
        INSERT INTO users (username, password_hash)
        VALUES (?, ?)
    `, [username, passwordHash]).then(([result]) => fetchUserById(result.insertId));
};

const updateUsernameById = (userId, username) => {
    return db.query(`
        UPDATE users
        SET username = ?
        WHERE user_id = ?
    `, [username, userId]).then(() => fetchUserById(userId));
};

const updatePasswordHash = (userId, passwordHash) => {
    return db.query(`
        UPDATE users
        SET password_hash = ?
        WHERE user_id = ?
    `, [passwordHash, userId]);
};

module.exports = {
    fetchUsers,
    fetchUserById,
    fetchUserByUsername,
    fetchUserCredentialsById,
    createUser,
    updateUsernameById,
    updatePasswordHash
};