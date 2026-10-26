const {
    getRelationshipsByRecord,
    getStatusHistoryByRecord,
    getLinksByRecord,
    getLinkableRecords
} = require('../controllers');

const recordsRouter = require('express').Router();

recordsRouter.route('/lookup/:record_type')
    .get(getLinkableRecords);

recordsRouter.route('/:record_type/:relationship_record_id/links')
    .get(getLinksByRecord);

recordsRouter.route('/:record_type/:relationship_record_id/relationships')
    .get(getRelationshipsByRecord);

recordsRouter.route('/:record_type/:relationship_record_id/status-history')
    .get(getStatusHistoryByRecord)

module.exports = recordsRouter;