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
    fetchRelationshipsByVulnerabilityId
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
    importVulnerabilityFindings
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
    fetchVendorRisks,
    fetchVendorRiskById,
    addVendorRisk,
    updateVendorRisk,
    updateVendorRiskStatus,
    removeVendorRisk,
    fetchVendorRiskNotesById,
    addVendorRiskNote,
    fetchRelationshipsByVendorRiskId
};