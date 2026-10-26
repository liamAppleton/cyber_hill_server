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
        })
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

    if (
        !Array.isArray(asset_ids)
        || asset_ids.length === 0
        || !asset_ids.every((id) => Number.isInteger(id) && id > 0)
    ) {
        return res.status(400).send({ error: 'asset_ids must be a non-empty array of asset IDs.' });
    }

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
const getNotesByVulnerabilityId = (req, res, next) => {
    const { vulnerability_id } = req.params;

    fetchNotesByVulnerabilityId(vulnerability_id)
        .then((notes) => {
            res.status(200).send({ notes });
        })
        .catch(next);
};

const postNoteToVulnerability = (req, res, next) => {
    const { vulnerability_id } = req.params;
    const body = typeof req.body?.body === 'string' ? req.body.body.trim() : '';

    if (!body) {
        return res.status(400).send({ error: 'Note body is required.' });
    }

    addNoteToVulnerability({ vulnerability_id, body, user_id: req.user.user_id })
        .then((note) => {
            res.status(201).send({ note });
        })
        .catch(next);
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
    getRelationshipsByVulnerabilityId,
    getNotesByVulnerabilityId,
    postNoteToVulnerability
};