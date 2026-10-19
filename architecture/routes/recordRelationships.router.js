const {
    getRelationships,
    getRelationshipById,
    postRelationship,
    deleteRelationship,
} = require('../controllers');

const recordRelationshipsRouter = require('express').Router();

recordRelationshipsRouter.route('/')
    .get(getRelationships)
    .post(postRelationship)

recordRelationshipsRouter.route('/:record_relationship_id')
    .get(getRelationshipById)
    .delete(deleteRelationship)

module.exports = recordRelationshipsRouter;