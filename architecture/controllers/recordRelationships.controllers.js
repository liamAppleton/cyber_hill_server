const {
    LINKABLE_TYPES,
    fetchRelationships,
    fetchRelationshipById,
    addRelationship,
    removeRelationship,
    fetchRelationshipsByRecord,
    fetchLinksByRecord,
    fetchLinkableRecords,
    fetchStatusHistoryByRecord
} = require('../models');

const handleError = (err, res, next) => {
    if (err?.status) return res.status(err.status).send({ error: err.message });
    return next(err);
};

const parseRecordParams = (req, res, allowedTypes) => {
    const { record_type, relationship_record_id } = req.params;

    if (!allowedTypes.includes(record_type)) {
        res.status(400).send({ error: `Record type must be one of: ${allowedTypes.join(', ')}.` });
        return null;
    }
    if (!/^\d+$/.test(relationship_record_id) || Number(relationship_record_id) < 1) {
        res.status(400).send({ error: 'Invalid record ID.' });
        return null;
    }
    return { type: record_type, id: Number(relationship_record_id) };
};

const getRelationships = (req, res, next) => {
    fetchRelationships()
        .then((relationships) => res.status(200).send({ relationships }))
        .catch(next);
};

const getRelationshipById = (req, res, next) => {
    fetchRelationshipById(req.params.record_relationship_id)
        .then((relationship) => (relationship
            ? res.status(200).send({ relationship })
            : res.status(404).send({ error: 'Relationship not found.' })))
        .catch(next);
};

const postRelationship = (req, res, next) => {
    addRelationship({ ...req.body, created_by: req.user.user_id })
        .then((relationship) => res.status(201).send({ relationship }))
        .catch((err) => handleError(err, res, next));
};

const deleteRelationship = (req, res, next) => {
    removeRelationship(req.params.record_relationship_id)
        .then((affected) => (affected
            ? res.status(204).send()
            : res.status(404).send({ error: 'Relationship not found.' })))
        .catch(next);
};

const getRelationshipsByRecord = (req, res, next) => {
    const record = parseRecordParams(req, res, [...LINKABLE_TYPES, 'asset', 'threat_article']);
    if (!record) return;

    fetchRelationshipsByRecord(record.type, record.id)
        .then((relationships) => res.status(200).send({ relationships }))
        .catch(next);
};

const getLinksByRecord = (req, res, next) => {
    const record = parseRecordParams(req, res, LINKABLE_TYPES);
    if (!record) return;

    fetchLinksByRecord(record.type, record.id)
        .then((links) => res.status(200).send({ links }))
        .catch(next);
};

const getLinkableRecords = (req, res, next) => {
    fetchLinkableRecords(req.params.record_type)
        .then((records) => res.status(200).send({ records }))
        .catch((err) => handleError(err, res, next));
};

const getStatusHistoryByRecord = (req, res, next) => {
    const record = parseRecordParams(req, res, [
        'vulnerability',
        'vulnerability_asset',
        'vendor_risk',
        'project',
        'threat_article'
    ]);
    if (!record) return;

    fetchStatusHistoryByRecord(record.type, record.id)
        .then((status_history) => res.status(200).send({ status_history }))
        .catch(next);
};

module.exports = {
    getRelationships,
    getRelationshipById,
    postRelationship,
    deleteRelationship,
    getRelationshipsByRecord,
    getLinksByRecord,
    getLinkableRecords,
    getStatusHistoryByRecord
};
