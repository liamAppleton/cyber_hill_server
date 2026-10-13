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
    getRelationshipsByVulnerabilityId
} = require('./vulnerabilities.controllers');
const {
    getVulnerabilityAssetById,
    patchVulnerabilityAssetById,
    deleteVulnerabilityAsset,
    getVulnerabilityAssetNotesById,
    postVulnerabilityAssetNote
} = require('./vulnerabilityAssets.controllers')

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
    getVulnerabilityAssetById,
    patchVulnerabilityAssetById,
    deleteVulnerabilityAsset,
    getVulnerabilityAssetNotesById,
    postVulnerabilityAssetNote
};