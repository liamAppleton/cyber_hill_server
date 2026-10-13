const {
    fetchVulnerabilities,
    fetchVulnerabilityById,
    addVulnerability
} = require('../models');

const getVulnerabilities = (req, res, next) => {
    fetchVulnerabilities()
        .then((vulnerabilities) => {
            res.status(200).send({ vulnerabilities })
        })
        .catch((err) => {
            next(err)
        })
}

const getVulnerabilityById = (req, res, next) => {
    const { vulnerability_id } = req.params;

    fetchVulnerabilityById(vulnerability_id)
        .then((vulnerability) => {
            res.status(200).send({ vulnerability })
        })
        .catch((err) => {
            next(err);
        })
}

const postVulnerability = (req, res, next) => {
    const { 
        title,
        description,
        cve,
        cvss,
        contextual_severity,
        source,
        date_discovered,
        status,
    } = req.body;
    resolved_at = null;

    addVulnerability({ title,description, cve, cvss, contextual_severity, source, date_discovered, status })
        .then((vulnerability) => {
            res.status(201).send({ vulnerability });
        })
        .catch((err) => {
            next(err);
        })
}

module.exports = {
    getVulnerabilities,
    getVulnerabilityById,
    postVulnerability
};