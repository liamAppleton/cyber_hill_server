const crypto = require('node:crypto');
const authModels = require('../models/auth.models');
const usersModels = require('../models/users.models');
const { hashPassword, verifyPassword } = require('../services/password-service');
const {
    SESSION_LIFETIME_MS,
    clearSessionCookie,
    getSessionToken,
    setSessionCookie
} = require('../middleware/require-auth');

const USERNAME_PATTERN = /^[\p{L}\p{N}._-]+$/u;
const MIN_PASSWORD_LENGTH = 12;
const MAX_PASSWORD_BYTES = 128;
const dummyHashPromise = hashPassword('not-a-real-account-password');

const invalidInput = (message) => {
    const error = new Error(message);
    error.statusCode = 400;
    return error;
};

const getValidatedUsername = (value) => {
    if (typeof value !== 'string') {
        throw invalidInput('username must be a string.');
    }

    const username = value.trim();
    if (
        username.length < 3 ||
        username.length > 100 ||
        !USERNAME_PATTERN.test(username)
    ) {
        throw invalidInput('username must be 3-100 characters and use only letters, numbers, periods, underscores, or hyphens.');
    }

    return username;
};

const getValidatedPassword = (value, field = 'password', minimumLength = MIN_PASSWORD_LENGTH) => {
    if (typeof value !== 'string') {
        throw invalidInput(`${field} must be a string.`);
    }

    const byteLength = Buffer.byteLength(value, 'utf8');
    if (byteLength < minimumLength || byteLength > MAX_PASSWORD_BYTES) {
        throw invalidInput(`${field} must be between ${minimumLength} and ${MAX_PASSWORD_BYTES} UTF-8 bytes.`);
    }

    return value;
};

const getRequestBody = (req) => (
    req.body && typeof req.body === 'object' && !Array.isArray(req.body)
        ? req.body
        : {}
);

const toUtcSqlDateTime = (date) => date.toISOString().slice(0, 19).replace('T', ' ');

const createAuthenticatedSession = (user, res) => {
    const token = crypto.randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + SESSION_LIFETIME_MS);

    return authModels.createSession(user.user_id, token, toUtcSqlDateTime(expiresAt))
        .then(() => {
            setSessionCookie(res, token);
            return user;
        });
};

const sendControllerError = (res, next, error) => {
    if (error.statusCode) {
        return res.status(error.statusCode).send({ error: error.message });
    }

    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).send({ error: 'That username is already in use.' });
    }

    return next(error);
};

const register = (req, res, next) => {
    let username;
    let password;

    try {
        const body = getRequestBody(req);
        username = getValidatedUsername(body.username);
        password = getValidatedPassword(body.password);
    } catch (error) {
        return sendControllerError(res, next, error);
    }

    return hashPassword(password)
        .then((passwordHash) => usersModels.createUser(username, passwordHash))
        .then((user) => createAuthenticatedSession(user, res))
        .then((user) => res.status(201).send({ user }))
        .catch((error) => sendControllerError(res, next, error));
};

const login = (req, res, next) => {
    let username;
    let password;

    try {
        const body = getRequestBody(req);
        username = getValidatedUsername(body.username);
        password = getValidatedPassword(body.password, 'password', 1);
    } catch (error) {
        return sendControllerError(res, next, error);
    }

    return usersModels.fetchUserByUsername(username)
        .then((user) => Promise.all([
            user,
            user ? Promise.resolve(user.password_hash) : dummyHashPromise
        ]))
        .then(([user, passwordHash]) => verifyPassword(password, passwordHash)
            .then((passwordMatches) => ({ user, passwordMatches })))
        .then(({ user, passwordMatches }) => {
            if (!user || !passwordMatches) {
                return res.status(401).send({ error: 'Invalid username or password.' });
            }

            return createAuthenticatedSession({
                user_id: user.user_id,
                username: user.username,
                created_at: user.created_at
            }, res).then((sessionUser) => res.status(200).send({ user: sessionUser }));
        })
        .catch((error) => sendControllerError(res, next, error));
};

const logout = (req, res, next) => {
    const token = getSessionToken(req);
    const deleteSession = token
        ? authModels.deleteSession(token)
        : Promise.resolve();

    return deleteSession
        .then(() => {
            clearSessionCookie(res);
            return res.status(204).end();
        })
        .catch(next);
};

const getCurrentUser = (req, res) => res.status(200).send({ user: req.user });

const changePassword = (req, res, next) => {
    let currentPassword;
    let newPassword;

    try {
        const body = getRequestBody(req);
        currentPassword = getValidatedPassword(body.current_password, 'current_password', 1);
        newPassword = getValidatedPassword(body.new_password, 'new_password');
    } catch (error) {
        return sendControllerError(res, next, error);
    }

    return usersModels.fetchUserCredentialsById(req.user.user_id)
        .then((user) => verifyPassword(currentPassword, user.password_hash)
            .then((passwordMatches) => ({ user, passwordMatches })))
        .then(({ user, passwordMatches }) => {
            if (!passwordMatches) {
                return res.status(400).send({ error: 'current_password is incorrect.' });
            }

            if (currentPassword === newPassword) {
                return res.status(400).send({
                    error: 'new_password must be different from current_password.'
                });
            }

            return hashPassword(newPassword)
                .then((passwordHash) => usersModels.updatePasswordHash(user.user_id, passwordHash))
                .then(() => authModels.deleteSessionsForUser(user.user_id))
                .then(() => {
                    clearSessionCookie(res);
                    return res.status(200).send({
                        message: 'Password changed. Please log in again.'
                    });
                });
        })
        .catch((error) => sendControllerError(res, next, error));
};

module.exports = {
    register,
    login,
    logout,
    getCurrentUser,
    changePassword
};
