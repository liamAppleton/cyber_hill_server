const {
    getVulnerabilities,
    getVulnerabilityById,
    postVulnerability
} = require('../controllers');

const vulnerabilitiesRouter = require('express').Router();

vulnerabilitiesRouter.route('/')
    .get(getVulnerabilities)
    .post(postVulnerability)

vulnerabilitiesRouter.route('/:vulnerability_id')
    .get(getVulnerabilityById)
   

module.exports = vulnerabilitiesRouter;