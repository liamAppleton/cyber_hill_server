const {
    getVendorRisks,
    getVendorRiskById,
    postVendorRisk,
    patchVendorRisk,
    patchVendorRiskStatus,
    deleteVendorRisk,
    getVendorRiskNotesById,
    postVendorRiskNote,
    getRelationshipsByVendorRiskId
} = require('../controllers');

const vendorRisksRouter = require('express').Router();

vendorRisksRouter.route('/')
    .get(getVendorRisks)
    .post(postVendorRisk)

vendorRisksRouter.route('/:vendor_risk_id')
    .get(getVendorRiskById)
    .patch(patchVendorRisk)
    .delete(deleteVendorRisk)

vendorRisksRouter.route('/:vendor_risk_id/status')
    .patch(patchVendorRiskStatus)

vendorRisksRouter.route('/:vendor_risk_id/notes')
    .get(getVendorRiskNotesById)
    .post(postVendorRiskNote)

vendorRisksRouter.route('/:vendor_risk_id/relationships')
    .get(getRelationshipsByVendorRiskId)

module.exports = vendorRisksRouter;