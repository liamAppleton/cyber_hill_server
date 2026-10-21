const assert = require('node:assert/strict');
const { test } = require('node:test');
const db = require('../../database/db');
const usersModels = require('./users.models');

test('lists users without selecting password hashes', () => {
    const originalQuery = db.query;
    let receivedQuery;
    db.query = (query) => {
        receivedQuery = query;
        return Promise.resolve([[
            { user_id: 1, username: 'analyst1', created_at: '2026-10-20T00:00:00.000Z' }
        ]]);
    };

    return usersModels.fetchUsers()
        .then((users) => {
            assert.match(receivedQuery, /SELECT user_id, username, created_at/);
            assert.doesNotMatch(receivedQuery, /password_hash/);
            assert.deepEqual(users, [{
                user_id: 1,
                username: 'analyst1',
                created_at: '2026-10-20T00:00:00.000Z'
            }]);
        })
        .finally(() => {
            db.query = originalQuery;
        });
});
