const createUsers = require('./users.seed');
const createAssets = require('./assets.seed')
const { 
    createVulnerabilities,
    createVulnerabilityAssets, 
    createVulnerabilityImports, 
    createVulnerabilityImportFindings,
    createVulnerabilityNotes,
    createVulnerabilityAssetNotes
    } = require('./vulnerabilities.seeds')

module.exports = {
    createUsers,
    createAssets,
    createVulnerabilities,
    createVulnerabilityAssets,
    createVulnerabilityImports,
    createVulnerabilityImportFindings,
    createVulnerabilityNotes,
    createVulnerabilityAssetNotes
}