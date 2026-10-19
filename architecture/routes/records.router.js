const {
    getRelationshipsByRecord,
    getStatusHistoryByRecord
} = require('../controllers');

const recordsRouter = require('express').Router();

recordsRouter.route('/:record_type/:relationship_record_id/relationships')
    .get(getRelationshipsByRecord);

recordsRouter.route('/:record_type/:relationship_record_id/status-history')
    .get(getStatusHistoryByRecord)

module.exports = recordsRouter;