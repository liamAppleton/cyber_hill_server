const apiRouter = require('express').Router();
const endpointsRouter = require('./endpoints.router');
const usersRouter = require('./users.router');
const vulnerabilitiesRouter = require('./vulnerabilities.router');
const vulnerabilityAssetsRouter = require('./vulnerabilityAssets.router');
const assetsRouter = require('./assets.router')

apiRouter.use('/', endpointsRouter);

apiRouter.use('/users', usersRouter);

apiRouter.use('/vulnerabilities', vulnerabilitiesRouter);

apiRouter.use('/vulnerability-assets', vulnerabilityAssetsRouter);

apiRouter.use('/assets', assetsRouter)

module.exports = apiRouter;