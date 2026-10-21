const db = require('../../database/db');
const crypto = require('node:crypto');

const hashSessionToken = (token) => crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

const createSession = (userId, token, expiresAt) => {
    const tokenHash = hashSessionToken(token);

    return db.query(`
        DELETE FROM user_sessions
        WHERE expires_at <= UTC_TIMESTAMP()
    `).then(() => db.query(`
        INSERT INTO user_sessions (user_id, token_hash, expires_at)
        VALUES (?, ?, ?)
    `, [userId, tokenHash, expiresAt]));
};

const fetchSessionUser = (token) => {
    const tokenHash = hashSessionToken(token);

    return db.query(`
        SELECT users.user_id, users.username, users.created_at
        FROM user_sessions
        JOIN users ON users.user_id = user_sessions.user_id
        WHERE user_sessions.token_hash = ?
            AND user_sessions.expires_at > UTC_TIMESTAMP()
    `, [tokenHash]).then(([rows]) => rows[0] || null);
};

const deleteSession = (token) => {
    const tokenHash = hashSessionToken(token);

    return db.query(`
        DELETE FROM user_sessions
        WHERE token_hash = ?
    `, [tokenHash]);
};

const deleteSessionsForUser = (userId) => db.query(`
    DELETE FROM user_sessions
    WHERE user_id = ?
`, [userId]);

module.exports = {
    createSession,
    fetchSessionUser,
    deleteSession,
    deleteSessionsForUser
};
