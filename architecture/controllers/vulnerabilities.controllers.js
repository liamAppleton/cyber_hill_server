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

const patchVulnerabilityById = (req, res, next) => {
    const { contextual_severity } = req.body;
    const { vulnerability_id } = req.params;

    updateVulnerabilityById({ contextual_severity, vulnerability_id })
        .then((vulnerability) => {
            res.status(200).send({ vulnerability })
        })
        .catch((err) => {
            next(err);
        })
}

const patchVulnerabilityStatusById = (req, res, next) => {
    const { status } = req.body;
    const { vulnerability_id } = req.params;

    updateVulnerabilityStatusById({ status, vulnerability_id })
        .then((vulnerability) => {
            res.status(200).send({ vulnerability });
   f     })
        .catch((err) => {
            next(err);
        });
};

const deleteVulnerability = (req, res, next) => {
    const { vulnerability_id } = req.params;

    removeVulnerability(vulnerability_id)
        .then(() => {
            res.status(204).send();
        })
        .catch((err) => {
            next(err);
        })
};

const getAssetsByVulnerabilityId = (req, res, next) => {
    const { vulnerability_id } = req.params;
    
    fetchAssetsByVulnerabilityId(vulnerability_id)
        .then((assets) => {
            res.status(200).send({ assets });
        })
        .catch((err) => {
            next(err)
        })
}

const postAssetsByVulnerabilityId = (req, res, next) => {
    const { vulnerability_id } = req.params;
    const { asset_ids } = req.body;

    addAssetsByVulnerabilityId(vulnerability_id, asset_ids)
        .then(() => {
            return fetchAssetsByVulnerabilityId(vulnerability_id);
        })
        .then((assets) => {
            res.status(201).send({ assets });
        })
        .catch((err) => {
            next(err);
        });
};

const getRelationshipsByVulnerabilityId = (req, res, next) => {
    const { vulnerability_id } = req.params;

    fetchRelationshipsByVulnerabilityId(vulnerability_id)
        .then((relationships) => {
            res.status(200).send({ relationships });
        })
        .catch((err) => {
            next(err);
        });
};


module.exports = {
    getVulnerabilities,
    getVulnerabilityById,
    postVulnerability,
    patchVulnerabilityById,
    patchVulnerabilityStatusById,
    deleteVulnerability,
    getAssetsByVulnerabilityId,
    postAssetsByVulnerabilityId,
    getRelationshipsByVulnerabilityId
};