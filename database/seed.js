const db = require('./db.js');

const { createUsers, 
        createAssets,
        createVulnerabilities, 
        createVulnerabilityAssets, 
        createVulnerabilityImports,
        createVulnerabilityImportFindings,
        createVulnerabilityNotes,
        createVulnerabilityAssetNotes
         } = require('./seeds');

const seed = ({
    usersData,
    assetsData,
    vulnerabilitiesData,
    vulnerabilityAssetsData,
    vulnerabilityImportsData,
    vulnerabilityImportFindingsData,
    vulnerabilityNotesData,
    vulnerabilityAssetNotesData
}) => {
    return db.query(`SET FOREIGN_KEY_CHECKS = 0`)
        .then(() => db.query(`DROP TABLE IF EXISTS vulnerability_asset_notes`))
        .then(() => db.query(`DROP TABLE IF EXISTS vulnerability_notes`))
        .then(() => db.query(`DROP TABLE IF EXISTS vulnerability_import_findings`))
        .then(() => db.query(`DROP TABLE IF EXISTS vulnerability_imports`))
        .then(() => db.query(`DROP TABLE IF EXISTS vulnerability_assets`))
        .then(() => db.query(`DROP TABLE IF EXISTS vulnerabilities`))
        .then(() => db.query(`DROP TABLE IF EXISTS assets`))
        .then(() => db.query(`DROP TABLE IF EXISTS users`))
        .then(() => db.query(`SET FOREIGN_KEY_CHECKS = 1`))
        .then(() => createUsers(usersData))
        .then(() => createAssets(assetsData))
        .then(() => createVulnerabilities(vulnerabilitiesData))
        .then(() => createVulnerabilityAssets(vulnerabilityAssetsData))
        .then(() => createVulnerabilityImports(vulnerabilityImportsData))
        .then(() => createVulnerabilityImportFindings(vulnerabilityImportFindingsData))
        .then(() => createVulnerabilityNotes(vulnerabilityNotesData))
        .then(() => createVulnerabilityAssetNotes(vulnerabilityAssetNotesData))
};

module.exports = seed;