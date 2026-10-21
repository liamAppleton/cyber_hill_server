const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');
const express = require('express');
const authModels = require('../models/auth.models');
const apiRouter = require('./api-router');

const app = express();
app.use('/api', apiRouter);

let server;
let baseUrl;
const originalFetchSessionUser = authModels.fetchSessionUser;

before(() => {
    authModels.fetchSessionUser = () => Promise.resolve(null);
    return new Promise((resolve) => {
        server = app.listen(0, () => {
            baseUrl = `http://127.0.0.1:${server.address().port}`;
            resolve();
        });
    });
});

after(() => {
    authModels.fetchSessionUser = originalFetchSessionUser;
    return new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
    });
});

test('allows public auth routes and protects application routes', async () => {
    const logoutResponse = await fetch(`${baseUrl}/api/auth/logout`, { method: 'POST' });
    assert.equal(logoutResponse.status, 204);

    const protectedResponse = await fetch(`${baseUrl}/api/vulnerabilities`);
    assert.equal(protectedResponse.status, 401);
    assert.deepEqual(await protectedResponse.json(), {
        error: 'Authentication is required.'
    });
});
