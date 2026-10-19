const {
    fetchRelationships,
    fetchRelationshipById,
    addRelationship,
    removeRelationship,
    fetchRelationshipsByRecord,
    fetchStatusHistoryByRecord
} = require('../models');

const getRelationships = (req, res, next) => {
    fetchRelationships()
        .then((relationships) => {
            res.status(200).send({ relationships })
        })
        .catch((err) => {
            next(err)
        })
}

const getRelationshipById = (req, res, next) => {
    const { record_relationship_id } = req.params;

    fetchRelationshipById(record_relationship_id)
        .then((relationship) => {
            res.status(200).send({ relationship })
        })
        .catch((err) => {
            next(err)
        })
}

const postRelationship = (req, res, next) => {
  const {
    source_record_type,
    source_record_id,
    target_record_type,
    target_record_id,
    relationship_type,
    created_by
  } = req.body || {};

  if (
    !source_record_type ||
    !source_record_id ||
    !target_record_type ||
    !target_record_id ||
    !relationship_type ||
    !created_by
  ) {
    return res.status(400).send({
      msg: "Missing required relationship fields"
    });
  }

  if (
    source_record_type === target_record_type &&
    Number(source_record_id) === Number(target_record_id)
  ) {
    return res.status(400).send({
      msg: "A record cannot have a relationship with itself"
    });
  }

  addRelationship({
    source_record_type,
    source_record_id,
    target_record_type,
    target_record_id,
    relationship_type,
    created_by
  })
    .then((relationship) => {
      res.status(201).send({ relationship });
    })
    .catch(next);
};

const deleteRelationship = (req, res, next) => {
    const { record_relationship_id } = req.params;

    removeRelationship(record_relationship_id)
        .then(() => {
            res.status(204).send()
        })
        .catch((err) => {
            next(err)
        })
}

const getRelationshipsByRecord = (req, res, next) => {
  const { record_type, relationship_record_id } = req.params;

  const allowedTypes = [
    "vulnerability",
    "asset",
    "vendor",
    "project",
    "threat_article"
  ];

  if (!allowedTypes.includes(record_type)) {
    return res.status(400).send({
      msg: "Invalid record type",
      allowed_values: allowedTypes
    });
  }

  if (!relationship_record_id || !/^\d+$/.test(relationship_record_id) || Number(relationship_record_id) < 1) {
    return res.status(400).send({
      msg: "Invalid record ID"
    });
  }

  fetchRelationshipsByRecord(record_type, Number(relationship_record_id))
    .then((relationships) => {
      res.status(200).send({ relationships });
    })
    .catch(next);
};

const getStatusHistoryByRecord = (req, res, next) => {
  const { record_type, relationship_record_id } = req.params;

  const allowedTypes = [
    "vulnerability",
    "vulnerability_asset",
    "vendor_risk",
    "project",
    "threat_article"
  ];

  if (!allowedTypes.includes(record_type)) {
    return res.status(400).send({
      msg: "Invalid record type",
      allowed_values: allowedTypes
    });
  }

  if (
    !relationship_record_id ||
    !/^\d+$/.test(relationship_record_id) ||
    Number(relationship_record_id) < 1
  ) {
    return res.status(400).send({
      msg: "Invalid relationship record ID"
    });
  }

  fetchStatusHistoryByRecord(
    record_type,
    Number(relationship_record_id)
  )
    .then((status_history) => {
      res.status(200).send({ status_history });
    })
    .catch(next);
};

module.exports = {
    getRelationships,
    getRelationshipById,
    postRelationship,
    deleteRelationship,
    getRelationshipsByRecord,
    getStatusHistoryByRecord
};