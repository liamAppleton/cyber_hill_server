const { fetchUsers } = require('./users.models');
const {
    fetchVulnerabilities,
    fetchVulnerabilityById,
    addVulnerability
} = require('.//vulnerabilities.models');

module.exports = {
    fetchUsers,
    fetchVulnerabilities,
    fetchVulnerabilityById,
    addVulnerability
};