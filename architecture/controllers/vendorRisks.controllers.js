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
} = require('../models');

const handleError = (err, res, next) => {
    if (err?.status) return res.status(err.status).send({ error: err.message });
    if (err?.code === 'ER_NO_REFERENCED_ROW_2') return res.status(404).send({ error: 'Referenced record not found.' });
    return next(err);
};

const getVendorRisks = (req, res, next) => {
    fetchVendorRisks()
        .then((vendor_risks) => {
            res.status(200).send({ vendor_risks })
        })
        .catch((err) => {
            next(err)
        })
}

const getVendorRiskById = (req, res, next) => {
    const { vendor_risk_id } = req.params;

    fetchVendorRiskById(vendor_risk_id)
        .then((vendor_risk) => {
            if (!vendor_risk) return res.status(404).send({ error: 'Vendor risk not found.' });
            res.status(200).send({ vendor_risk })
        })
        .catch(next)
}

const postVendorRisk = (req, res, next) => {
    const { vendor_id, title, description, risk_level, status, date_identified } = req.body;

    addVendorRisk({ vendor_id, title, description, risk_level, status, date_identified })
        .then((vendor_risk) => {
            res.status(201).send({ vendor_risk})
        })
        .catch((err) => handleError(err, res, next))
}

const patchVendorRisk = (req, res, next) => {
    const { vendor_risk_id } = req.params;
    const updates = req.body;

    updateVendorRisk(vendor_risk_id, updates)
        .then((vendor_risk) => {
            res.status(200).send({ vendor_risk })
        })
        .catch((err) => handleError(err, res, next))
}

const patchVendorRiskStatus = (req, res, next) => {
    const { vendor_risk_id } = req.params;
    const { status } = req.body;

    updateVendorRiskStatus(vendor_risk_id, status)
        .then((vendor_risk) => {
            res.status(200).send({ vendor_risk })
        })
        .catch((err) => handleError(err, res, next))
}

const deleteVendorRisk = (req, res, next) => {
    const { vendor_risk_id } = req.params;

    removeVendorRisk(vendor_risk_id)
        .then((affected) => {
            if (!affected) return res.status(404).send({ error: 'Vendor risk not found.' });
            res.status(204).send()
        })
        .catch(next)
}

const getVendorRiskNotesById = (req, res, next) => {
    const { vendor_risk_id } = req.params;

    fetchVendorRiskNotesById(vendor_risk_id)
        .then((vendor_risk_notes) => {
            res.status(200).send({ vendor_risk_notes})
        })
        .catch((err) => {
            next(err)
        })
}

const postVendorRiskNote = (req, res, next) => {
    const { vendor_risk_id } = req.params;
    const body = typeof req.body?.body === 'string' ? req.body.body.trim() : '';

    if (!body) return res.status(400).send({ error: 'Note body is required.' });

    addVendorRiskNote(vendor_risk_id, body, req.user.user_id)
        .then((vendor_risk_note) => {
            res.status(201).send({ vendor_risk_note})
        })
        .catch((err) => handleError(err, res, next))
}

const getRelationshipsByVendorRiskId = (req, res, next) => {
    const { vendor_risk_id } = req.params;

    fetchRelationshipsByVendorRiskId(vendor_risk_id)
        .then((vendor_risk_relationship_records) => {
            res.status(200).send({ vendor_risk_relationship_records})
        })
        .catch((err) => {
            next(err)
        })
}

module.exports = {
    getVendorRisks,
    getVendorRiskById,
    postVendorRisk,
    patchVendorRisk,
    patchVendorRiskStatus,
    deleteVendorRisk,
    getVendorRiskNotesById,
    postVendorRiskNote,
    getRelationshipsByVendorRiskId
};