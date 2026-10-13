const express = require('express');
const app = express();
const path = require('path')
const apiRouter = require('./architecture/routes/api-router');

app.use(express.json());

// Serve the API documentation HTML, CSS and JavaScript.
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', apiRouter)

module.exports = app;