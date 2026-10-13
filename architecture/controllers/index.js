const getEndpoints = require('./endpoints.contollers')
const { getUsers } = require('./users.controllers');
const {
    getVulnerabilities,
    getVulnerabilityById,
    postVulnerability
} = require('./vulnerabilities.controllers');

module.exports = {
    getEndpoints,
    getUsers,
    getVulnerabilities,
    getVulnerabilityById,
    postVulnerability
};