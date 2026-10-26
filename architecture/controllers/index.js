const getEndpoints = require('./endpoints.contollers')
const { getUsers } = require('./users.controllers');
const {
    getVulnerabilities,
    getVulnerabilityById,
    postVulnerability,
    patchVulnerabilityById,
    patchVulnerabilityStatusById,
    deleteVulnerability,
    getAssetsByVulnerabilityId,
    postAssetsByVulnerabilityId,
    getRelationshipsByVulnerabilityId,
    getNotesByVulnerabilityId,
    postNoteToVulnerability
} = require('./vulnerabilities.controllers');
const {
    getVulnerabilityAssetById,
    patchVulnerabilityAssetById,
    deleteVulnerabilityAsset,
    getVulnerabilityAssetNotesById,
    postVulnerabilityAssetNote
} = require('./vulnerabilityAssets.controllers')
const {
    getAssets,
    getAssetById,
    postAsset,
    patchAsset,
    getVulnerabilitiesByAssetId,
    deleteAsset
} = require('./assets.controllers');
const {
    getVendors,
    getVendorById,
    postVendor,
    patchVendor,
    deleteVendor,
    getVendorRisksById,
    getVendorNotesById,
    postVendorNote
} = require('./vendors.controllers')
const {
    getVulnerabilityImports,
    getVulnerabilityImportById,
    getVulnerabilityImportFindings,
    getVulnerabilityImportFindingById,
    postVulnerabilityImport,
    postPromoteStagedFindings,
    postDiscardStagedFindings
} = require('./vulnerabilityImports.controllers')
const {
    getVendorRisks,
    getVendorRiskById,
    postVendorRisk,
    patchVendorRisk,
    patchVendorRiskStatus,
    deleteVendorRisk,
    getVendorRiskNotesById,
    postVendorRiskNote,
    getRelationshipsByVendorRiskId
} = require('./vendorRisks.controllers');
const {
    getProjects,
    getProjectById,
    postProject,
    patchProject,
    patchProjectStatus,
    deleteProject,
    getProjectNotesById,
    postProjectNote,
    getRelationshipsByProjectId
} = require('./projects.controllers')
const {
    getRelationships,
    getRelationshipById,
    postRelationship,
    deleteRelationship,
    getRelationshipsByRecord,
    getStatusHistoryByRecord,
    getLinksByRecord,
    getLinkableRecords
} = require('./recordRelationships.controllers')
const {
    getStatusHistory
} = require('./statusHistory.controllers')
const {
    getAuditLog,
    getAuditLogById
} = require('./auditLogs.controllers');

module.exports = {
    getEndpoints,
    getUsers,
    getVulnerabilities,
    getVulnerabilityById,
    postVulnerability,
    patchVulnerabilityById,
    patchVulnerabilityStatusById,
    deleteVulnerability,
    getAssetsByVulnerabilityId,
    postAssetsByVulnerabilityId,
    getRelationshipsByVulnerabilityId,
    getNotesByVulnerabilityId,
    postNoteToVulnerability,
    getVulnerabilityAssetById,
    patchVulnerabilityAssetById,
    deleteVulnerabilityAsset,
    getVulnerabilityAssetNotesById,
    postVulnerabilityAssetNote,
    getAssets,
    getAssetById,
    postAsset,
    patchAsset,
    getVulnerabilitiesByAssetId,
    deleteAsset,
    getVendors,
    getVendorById,
    postVendor,
    patchVendor,
    deleteVendor,
    getVendorRisksById,
    getVendorNotesById,
    postVendorNote,
    getVulnerabilityImports,
    getVulnerabilityImportById,
    getVulnerabilityImportFindings,
    getVulnerabilityImportFindingById,
    postVulnerabilityImport,
    postPromoteStagedFindings,
    postDiscardStagedFindings,
    getVendorRisks,
    getVendorRiskById,
    postVendorRisk,
    patchVendorRisk,
    patchVendorRiskStatus,
    deleteVendorRisk,
    getVendorRiskNotesById,
    postVendorRiskNote,
    getRelationshipsByVendorRiskId,
    getProjects,
    getProjectById,
    postProject,
    patchProject,
    patchProjectStatus,
    deleteProject,
    getProjectNotesById,
    postProjectNote,
    getRelationshipsByProjectId,
    getRelationships,
    getRelationshipById,
    postRelationship,
    deleteRelationship,
    getRelationshipsByRecord,
    getStatusHistory,
    getStatusHistoryByRecord,
    getLinksByRecord,
    getLinkableRecords,
    getAuditLog,
    getAuditLogById
};