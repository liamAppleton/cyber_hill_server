const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');
const express = require('express');
const authModels = require('../models/auth.models');
const usersModels = require('../models/users.models');
const { hashPassword, verifyPassword } = require('../services/password-service');
const authRouter = require('./auth.router');
const usersRouter = require('./users.router');
const { requireAuth } = require('../middleware/require-auth');

const VALID_TOKEN = 'A'.repeat(43);
const INVALID_TOKEN = 'B'.repeat(43);
const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);
app.use(requireAuth);
app.use('/api/users', usersRouter);
app.get('/api/protected', (req, res) => res.status(200).send({ user: req.user }));
app.use((error, req, res, next) => {
    res.status(500).send({ error: error.message });
});

let server;
let baseUrl;

before(() => new Promise((resolve) => {
    server = app.listen(0, () => {
        baseUrl = `http://127.0.0.1:${server.address().port}`;
        resolve();
    });
}));

after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
}));

const replaceMethods = (target, replacements) => {
    const originals = Object.fromEntries(
        Object.keys(replacements).map((key) => [key, target[key]])
    );
    Object.assign(target, replacements);
    return () => Object.assign(target, originals);
};

const postJson = (url, body, headers = {}) => fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body)
});

const patchJson = (url, body, headers = {}) => fetch(url, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body)
});

const sessionCookieFrom = (response) => response.headers.get('set-cookie')
    .split(';')[0];

test('registers with a scrypt hash and creates an HttpOnly session', () => {
    let insertedPasswordHash;
    let createdSession;
    const restoreUsers = replaceMethods(usersModels, {
        createUser: (username, passwordHash) => {
            insertedPasswordHash = passwordHash;
            return Promise.resolve({
                user_id: 12,
                username,
                created_at: '2026-10-20T00:00:00.000Z'
            });
        }
    });
    const restoreAuth = replaceMethods(authModels, {
        createSession: (userId, token, expiresAt) => {
            createdSession = { userId, token, expiresAt };
            return Promise.resolve();
        }
    });

    return postJson(`${baseUrl}/api/auth/register`, {
        username: 'analyst1',
        password: 'correct horse battery staple'
    }).then(async (response) => {
        assert.equal(response.status, 201);
        assert.match(response.headers.get('set-cookie'), /HttpOnly/);
        assert.match(response.headers.get('set-cookie'), /SameSite=Strict/);
        const body = await response.json();
        assert.deepEqual(body.user, {
            user_id: 12,
            username: 'analyst1',
            created_at: '2026-10-20T00:00:00.000Z'
        });
        assert.equal(Object.hasOwn(body.user, 'password_hash'), false);
        assert.notEqual(insertedPasswordHash, 'correct horse battery staple');
        assert.equal(
            await verifyPassword('correct horse battery staple', insertedPasswordHash),
            true
        );
        assert.equal(createdSession.userId, 12);
        assert.match(createdSession.token, /^[A-Za-z0-9_-]{43}$/);
    }).finally(() => {
        restoreUsers();
        restoreAuth();
    });
});

test('rejects passwords below the minimum length', () => postJson(`${baseUrl}/api/auth/register`, {
    username: 'analyst1',
    password: 'short'
}).then(async (response) => {
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), {
        error: 'password must be between 12 and 128 UTF-8 bytes.'
    });
}));

test('logs in with valid credentials and uses a generic invalid-credentials response', async () => {
    const passwordHash = await hashPassword('correct horse battery staple');
    let createdSession = false;
    const restoreUsers = replaceMethods(usersModels, {
        fetchUserByUsername: (username) => Promise.resolve(
            username === 'analyst1'
                ? {
                    user_id: 12,
                    username,
                    password_hash: passwordHash,
                    created_at: '2026-10-20T00:00:00.000Z'
                }
                : null
        )
    });
    const restoreAuth = replaceMethods(authModels, {
        createSession: () => {
            createdSession = true;
            return Promise.resolve();
        }
    });

    try {
        const response = await postJson(`${baseUrl}/api/auth/login`, {
            username: 'analyst1',
            password: 'correct horse battery staple'
        });
        assert.equal(response.status, 200);
        assert.match(response.headers.get('set-cookie'), /HttpOnly/);
        assert.equal((await response.json()).user.username, 'analyst1');
        assert.equal(createdSession, true);

        const invalidResponse = await postJson(`${baseUrl}/api/auth/login`, {
            username: 'analyst1',
            password: 'incorrect long passphrase'
        });
        assert.equal(invalidResponse.status, 401);
        assert.deepEqual(await invalidResponse.json(), {
            error: 'Invalid username or password.'
        });
    } finally {
        restoreUsers();
        restoreAuth();
    }
});

test('requires a valid session for current-user and application endpoints', async () => {
    const user = {
        user_id: 12,
        username: 'analyst1',
        created_at: '2026-10-20T00:00:00.000Z'
    };
    const restoreAuth = replaceMethods(authModels, {
        fetchSessionUser: (token) => Promise.resolve(token === VALID_TOKEN ? user : null)
    });

    try {
        const missingResponse = await fetch(`${baseUrl}/api/auth/me`);
        assert.equal(missingResponse.status, 401);

        const protectedResponse = await fetch(`${baseUrl}/api/protected`, {
            headers: { cookie: `cyberhill_session=${VALID_TOKEN}` }
        });
        assert.equal(protectedResponse.status, 200);
        assert.deepEqual(await protectedResponse.json(), { user });

        const expiredResponse = await fetch(`${baseUrl}/api/auth/me`, {
            headers: { cookie: `cyberhill_session=${INVALID_TOKEN}` }
        });
        assert.equal(expiredResponse.status, 401);
    } finally {
        restoreAuth();
    }
});

test('logout revokes the session and clears its cookie', async () => {
    let deletedToken;
    const restoreAuth = replaceMethods(authModels, {
        deleteSession: (token) => {
            deletedToken = token;
            return Promise.resolve();
        }
    });

    try {
        const response = await postJson(`${baseUrl}/api/auth/logout`, {}, {
            cookie: `cyberhill_session=${VALID_TOKEN}`
        });
        assert.equal(response.status, 204);
        assert.equal(deletedToken, VALID_TOKEN);
        assert.match(response.headers.get('set-cookie'), /Expires=Thu, 01 Jan 1970/);
    } finally {
        restoreAuth();
    }
});

test('password change verifies the old password and revokes every session', async () => {
    const oldHash = await hashPassword('correct horse battery staple');
    let updatedPasswordHash;
    let revokedUserId;
    const restoreUsers = replaceMethods(usersModels, {
        fetchUserCredentialsById: () => Promise.resolve({
            user_id: 12,
            username: 'analyst1',
            password_hash: oldHash
        }),
        updatePasswordHash: (userId, passwordHash) => {
            updatedPasswordHash = passwordHash;
            assert.equal(userId, 12);
            return Promise.resolve();
        }
    });
    const restoreAuth = replaceMethods(authModels, {
        fetchSessionUser: () => Promise.resolve({
            user_id: 12,
            username: 'analyst1',
            created_at: '2026-10-20T00:00:00.000Z'
        }),
        deleteSessionsForUser: (userId) => {
            revokedUserId = userId;
            return Promise.resolve();
        }
    });

    try {
        const response = await patchJson(`${baseUrl}/api/auth/password`, {
            current_password: 'correct horse battery staple',
            new_password: 'another secure passphrase'
        }, {
            cookie: `cyberhill_session=${VALID_TOKEN}`
        });
        assert.equal(response.status, 200);
        assert.equal(revokedUserId, 12);
        assert.equal(await verifyPassword('another secure passphrase', updatedPasswordHash), true);
        assert.match(response.headers.get('set-cookie'), /Expires=Thu, 01 Jan 1970/);
    } finally {
        restoreUsers();
        restoreAuth();
    }
});

test('user endpoints omit password hashes and only allow self-profile updates', async () => {
    const user = {
        user_id: 12,
        username: 'analyst1',
        created_at: '2026-10-20T00:00:00.000Z'
    };
    const restoreAuth = replaceMethods(authModels, {
        fetchSessionUser: () => Promise.resolve(user)
    });
    let requestedUpdate;
    const restoreUsers = replaceMethods(usersModels, {
        fetchUsers: () => Promise.resolve([user]),
        fetchUserById: (userId) => Promise.resolve(userId === 12 ? user : null),
        updateUsernameById: (userId, username) => {
            requestedUpdate = { userId, username };
            return Promise.resolve({ ...user, username });
        }
    });
    const cookie = { cookie: `cyberhill_session=${VALID_TOKEN}` };

    try {
        const listResponse = await fetch(`${baseUrl}/api/users`, { headers: cookie });
        assert.equal(listResponse.status, 200);
        const listBody = await listResponse.json();
        assert.equal(Object.hasOwn(listBody.users[0], 'password_hash'), false);

        const userResponse = await fetch(`${baseUrl}/api/users/12`, { headers: cookie });
        assert.equal(userResponse.status, 200);
        assert.equal((await userResponse.json()).user.user_id, 12);

        const forbiddenResponse = await patchJson(`${baseUrl}/api/users/13`, {
            username: 'other_user'
        }, cookie);
        assert.equal(forbiddenResponse.status, 403);

        const patchResponse = await patchJson(`${baseUrl}/api/users/12`, {
            username: 'security_analyst'
        }, cookie);
        assert.equal(patchResponse.status, 200);
        assert.deepEqual(requestedUpdate, { userId: 12, username: 'security_analyst' });
    } finally {
        restoreUsers();
        restoreAuth();
    }
});
