const apiRouter = require('express').Router();
const endpointsRouter = require('./endpoints.router');
const usersRouter = require('./users.router');
const vulnerabilitiesRouter = require('./vulnerabilities.router')

apiRouter.use('/', endpointsRouter);

apiRouter.use('/users', usersRouter)

apiRouter.use('/vulnerabilities', vulnerabilitiesRouter)

module.exports = apiRouter;