const { fetchUsers } = require('./users.models');
const {
    fetchVulnerabilities,
    fetchVulnerabilityById,
    addVulnerability,
    updateVulnerabilityById,
    updateVulnerabilityStatusById,
    removeVulnerability,
    fetchAssetsByVulnerabilityId,
    addAssetsByVulnerabilityId,
    fetchRelationshipsByVulnerabilityId,
    fetchNotesByVulnerabilityId,
    addNoteToVulnerability
} = require('.//vulnerabilities.models');
const {
    fetchVulnerabilityAssetById,
    updateVulnerabilityAssetById,
    removeVulnerabilityAsset,
    fetchVulnerabilityAssetNotesById,
    addVulnerabilityAssetNote
} = require('./vulnerabilityAssets.models')
const {
    fetchAssets,
    fetchAssetById,
    addAsset,
    updateAsset,
    fetchVulnerabilitiesByAssetId,
    removeAsset
} = require('./assets.models');
const {
    fetchVendors,
    fetchVendorById,
    addVendor,
    updateVendor,
    removeVendor,
    fetchVendorRisksById,
    fetchVendorNotesById,
    addVendorNote
} = require('./vendors.models');
const {
    fetchVulnerabilityImports,
    fetchVulnerabilityImportById,
    fetchVulnerabilityImportFindings,
    fetchVulnerabilityImportFindingById,
    importVulnerabilityFindings,
    promoteStagedFindings,
    discardStagedFindings
} = require('./vulnerabilityImports.models');
const {
    fetchVendorRisks,
    fetchVendorRiskById,
    addVendorRisk,
    updateVendorRisk,
    updateVendorRiskStatus,
    removeVendorRisk,
    fetchVendorRiskNotesById,
    addVendorRiskNote,
    fetchRelationshipsByVendorRiskId
} = require('./vendorRisks.models')
const {
    fetchProjects,
    fetchProjectById,
    addProject,
    updateProject,
    updateProjectStatus,
    removeProject,
    fetchProjectNotesById,
    addProjectNote,
    fetchRelationshipsByProjectId,
} = require('./projects.models');
const {
    fetchRelationships,
    fetchRelationshipById,
    addRelationship,
    removeRelationship,
    fetchRelationshipsByRecord,
    fetchStatusHistoryByRecord,
    LINKABLE_TYPES,
    RELATIONSHIP_TYPES,
    fetchLinksByRecord,
    fetchLinkableRecords,
    removeRelationshipsForRecord
} = require('./recordRelationships.models')
const {
    fetchStatusHistory
} = require('./statusHistory.models');
const {
    fetchAuditLog,
    fetchAuditLogById
} = require('./auditLogs.models');

module.exports = {
    fetchUsers,
    fetchVulnerabilities,
    fetchVulnerabilityById,
    addVulnerability,
    updateVulnerabilityById,
    updateVulnerabilityStatusById,
    removeVulnerability,
    fetchAssetsByVulnerabilityId,
    addAssetsByVulnerabilityId,
    fetchRelationshipsByVulnerabilityId,
    fetchNotesByVulnerabilityId,
    addNoteToVulnerability,
    fetchVulnerabilityAssetById,
    updateVulnerabilityAssetById,
    removeVulnerabilityAsset,
    fetchVulnerabilityAssetNotesById,
    addVulnerabilityAssetNote,
    fetchAssets,
    fetchAssetById,
    addAsset,
    updateAsset,
    fetchVulnerabilitiesByAssetId,
    removeAsset,
    fetchVendors,
    fetchVendorById,
    addVendor,
    updateVendor,
    removeVendor,
    fetchVendorRisksById,
    fetchVendorNotesById,
    addVendorNote,
    fetchVulnerabilityImports,
    fetchVulnerabilityImportById,
    fetchVulnerabilityImportFindings,
    fetchVulnerabilityImportFindingById,
    importVulnerabilityFindings,
    promoteStagedFindings,
    discardStagedFindings,
    fetchVendorRisks,
    fetchVendorRiskById,
    addVendorRisk,
    updateVendorRisk,
    updateVendorRiskStatus,
    removeVendorRisk,
    fetchVendorRiskNotesById,
    addVendorRiskNote,
    fetchRelationshipsByVendorRiskId,
    fetchProjects,
    fetchProjectById,
    addProject,
    updateProject,
    updateProjectStatus,
    removeProject,
    fetchProjectNotesById,
    addProjectNote,
    fetchRelationshipsByProjectId,
    fetchRelationships,
    fetchRelationshipById,
    addRelationship,
    removeRelationship,
    fetchRelationshipsByRecord,
    fetchStatusHistory,
    fetchStatusHistoryByRecord,
    fetchLinksByRecord,
    fetchLinkableRecords,
    removeRelationshipsForRecord,
    LINKABLE_TYPES,
    RELATIONSHIP_TYPES,
    fetchAuditLog,
    fetchAuditLogById
};