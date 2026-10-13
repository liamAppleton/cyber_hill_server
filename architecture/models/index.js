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
    addVulnerabilityAssetNote
};