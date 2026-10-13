const express = require('express');
const app = express();
const apiRouter = require('./architecture/routes/api-router');

app.use(express.json());

app.use('/api', apiRouter)

module.exports = app;