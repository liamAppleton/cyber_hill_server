const createUsers = require('./users.seed');
const createAssets = require('./assets.seed')
const { 
    createVulnerabilities,
    createVulnerabilityAssets, 
    createVulnerabilityImports, 
    createVulnerabilityImportFindings,
    createVulnerabilityNotes,
    createVulnerabilityAssetNotes
    } = require('./vulnerabilities.seed')
const {
    createVendors,
    createVendorNotes,
    createVendorRisks,
    createVendorRiskNotes
} = require('./vendors.seed');
const {
    createProjects,
    createProjectNotes
} = require('./projects.seed')
const createStatusHistory = require('./statusHistory.seed');
const createAuditLog = require('./auditLog.seeds')
const createRecordRelationships = require('./recordRelationships.seed')
const createReports = require('./reports.seed')
const createThreatArticles = require('./threatArticles.seed')

module.exports = {
    createUsers,
    createAssets,
    createVulnerabilities,
    createVulnerabilityAssets,
    createVulnerabilityImports,
    createVulnerabilityImportFindings,
    createVulnerabilityNotes,
    createVulnerabilityAssetNotes,
    createVendors,
    createVendorNotes,
    createVendorRisks,
    createVendorRiskNotes,
    createProjects,
    createProjectNotes,
    createStatusHistory,
    createAuditLog,
    createRecordRelationships,
    createReports,
    createThreatArticles
}