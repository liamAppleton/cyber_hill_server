const db = require('./db.js');

const { createUsers, 
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
         } = require('./seeds');

const seed = ({
    usersData,
    assetsData,
    vulnerabilitiesData,
    vulnerabilityAssetsData,
    vulnerabilityImportsData,
    vulnerabilityImportFindingsData,
    vulnerabilityNotesData,
    vulnerabilityAssetNotesData,
    vendorsData,
    vendorNotesData,
    vendorRisksData,
    vendorRiskNotesData,
    projectsData,
    projectNotesData,
    statusHistoryData,
    auditLogData,
    recordRelationshipsData,
    reportsData,
    threatArticlesData
}) => {
    return db.query(`SET FOREIGN_KEY_CHECKS = 0`)
        .then(() => db.query(`DROP TABLE IF EXISTS reports`))
        .then(() => db.query(`DROP TABLE IF EXISTS record_relationships`))
        .then(() => db.query(`DROP TABLE IF EXISTS audit_log`))
        .then(() => db.query(`DROP TABLE IF EXISTS status_history`))
        .then(() => db.query(`DROP TABLE IF EXISTS project_notes`))
        .then(() => db.query(`DROP TABLE IF EXISTS projects`))
        .then(() => db.query(`DROP TABLE IF EXISTS vendor_risk_notes`))
        .then(() => db.query(`DROP TABLE IF EXISTS vendor_risks`))
        .then(() => db.query(`DROP TABLE IF EXISTS vendor_notes`))
        .then(() => db.query(`DROP TABLE IF EXISTS vendors`))
        .then(() => db.query(`DROP TABLE IF EXISTS vulnerability_asset_notes`))
        .then(() => db.query(`DROP TABLE IF EXISTS vulnerability_notes`))
        .then(() => db.query(`DROP TABLE IF EXISTS vulnerability_import_findings`))
        .then(() => db.query(`DROP TABLE IF EXISTS vulnerability_imports`))
        .then(() => db.query(`DROP TABLE IF EXISTS vulnerability_assets`))
        .then(() => db.query(`DROP TABLE IF EXISTS vulnerabilities`))
        .then(() => db.query(`DROP TABLE IF EXISTS threat_articles`))
        .then(() => db.query(`DROP TABLE IF EXISTS assets`))
        .then(() => db.query(`DROP TABLE IF EXISTS users`))
        .then(() => db.query(`SET FOREIGN_KEY_CHECKS = 1`))
        .then(() => createUsers(usersData))
        .then(() => createAssets(assetsData))
        .then(() => createThreatArticles(threatArticlesData))
        .then(() => createVulnerabilities(vulnerabilitiesData))
        .then(() => createVulnerabilityAssets(vulnerabilityAssetsData))
        .then(() => createVulnerabilityImports(vulnerabilityImportsData))
        .then(() => createVulnerabilityImportFindings(vulnerabilityImportFindingsData))
        .then(() => createVulnerabilityNotes(vulnerabilityNotesData))
        .then(() => createVulnerabilityAssetNotes(vulnerabilityAssetNotesData))
        .then(() => createVendors(vendorsData))
        .then(() => createVendorNotes(vendorNotesData))
        .then(() => createVendorRisks(vendorRisksData))
        .then(() => createVendorRiskNotes(vendorRiskNotesData))
        .then(() => createProjects(projectsData))
        .then(() => createProjectNotes(projectNotesData))
        .then(() => createStatusHistory(statusHistoryData))
        .then(() => createAuditLog(auditLogData))
        .then(() => createRecordRelationships(recordRelationshipsData))
        .then(() => createReports(reportsData))
};

module.exports = seed;