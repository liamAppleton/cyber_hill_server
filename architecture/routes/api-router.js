const apiRouter = require('express').Router();
const endpointsRouter = require('./endpoints.router');
const usersRouter = require('./users.router');
const vulnerabilitiesRouter = require('./vulnerabilities.router');
const vulnerabilityAssetsRouter = require('./vulnerabilityAssets.router');
const assetsRouter = require('./assets.router')
const vendorsRouter = require('./vendors.router')
const vulnerabilityImportsRouter = require('./vulnerabilityImports.router')
const vulnerabilityImportFindingsRouter = require('./vulnerabilityImportFindings.router')
const vendorRisksRouter = require('./vendorRisks.router')
const projectsRouter = require('./projects.router');
const recordRelationshipsRouter = require('./recordRelationships.router')
const recordsRouter = require('./records.router')
const statusHistoryRouter = require('./statusHistory.router')
const auditLogRouter = require('./auditLog.router');

apiRouter.use('/', endpointsRouter);

apiRouter.use('/users', usersRouter);

apiRouter.use('/vulnerabilities', vulnerabilitiesRouter);

apiRouter.use('/vulnerability-assets', vulnerabilityAssetsRouter);

apiRouter.use('/vulnerability-imports', vulnerabilityImportsRouter);

apiRouter.use('/vulnerability-import-findings', vulnerabilityImportFindingsRouter);

apiRouter.use('/assets', assetsRouter);

apiRouter.use('/vendors', vendorsRouter);

apiRouter.use('/vendor-risks', vendorRisksRouter);

apiRouter.use('/projects', projectsRouter);

apiRouter.use('/relationships', recordRelationshipsRouter);

apiRouter.use('/records', recordsRouter);

apiRouter.use('/status-history', statusHistoryRouter);

apiRouter.use('/audit-logs', auditLogRouter);

module.exports = apiRouter;