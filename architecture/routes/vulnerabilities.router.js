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
} = require('../controllers');

const vulnerabilitiesRouter = require('express').Router();

vulnerabilitiesRouter.route('/')
    .get(getVulnerabilities)
    .post(postVulnerability)

vulnerabilitiesRouter.route('/:vulnerability_id')
    .get(getVulnerabilityById)
    .patch(patchVulnerabilityById)
    .delete(deleteVulnerability)

vulnerabilitiesRouter.route('/:vulnerability_id/status')
    .patch(patchVulnerabilityStatusById)

vulnerabilitiesRouter.route('/:vulnerability_id/assets')
    .get(getAssetsByVulnerabilityId)
    .post(postAssetsByVulnerabilityId)

vulnerabilitiesRouter.route('/:vulnerability_id/relationships')
    .get(getRelationshipsByVulnerabilityId)

vulnerabilitiesRouter.route('/:vulnerability_id/notes')
    .get(getNotesByVulnerabilityId)
    .post(postNoteToVulnerability)


module.exports = vulnerabilitiesRouter;