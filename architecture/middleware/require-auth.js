const authModels = require('../models/auth.models');

const COOKIE_NAME = 'cyberhill_session';
const SESSION_LIFETIME_MS = 8 * 60 * 60 * 1000;

const getCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api'
});

const getSessionToken = (req) => {
    const cookieHeader = req.get('cookie');
    if (!cookieHeader) return null;

    const cookie = cookieHeader
        .split(';')
        .map((part) => part.trim())
        .find((part) => part.startsWith(`${COOKIE_NAME}=`));
    if (!cookie) return null;

    const token = cookie.slice(COOKIE_NAME.length + 1);
    return /^[A-Za-z0-9_-]{43}$/.test(token) ? token : null;
};

const clearSessionCookie = (res) => {
    res.clearCookie(COOKIE_NAME, getCookieOptions());
};

const setSessionCookie = (res, token) => {
    res.cookie(COOKIE_NAME, token, {
        ...getCookieOptions(),
        maxAge: SESSION_LIFETIME_MS
    });
};

const requireAuth = (req, res, next) => {
    const token = getSessionToken(req);
    if (!token) {
        return res.status(401).send({ error: 'Authentication is required.' });
    }

    return authModels.fetchSessionUser(token)
        .then((user) => {
            if (!user) {
                clearSessionCookie(res);
                return res.status(401).send({ error: 'Authentication is required.' });
            }

            req.user = user;
            return next();
        })
        .catch(next);
};

module.exports = {
    COOKIE_NAME,
    SESSION_LIFETIME_MS,
    getCookieOptions,
    getSessionToken,
    clearSessionCookie,
    setSessionCookie,
    requireAuth
};
