const express = require('express');
const app = express();
const {
    getEndpoints,
    getUsers
} = require('./controllers')

app.use(express.json());

app.get('/api', getEndpoints)

app.get('/api/users', getUsers)

module.exports = app;