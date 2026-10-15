const {
    getVendors,
    getVendorById,
    postVendor,
    patchVendor,
    deleteVendor,
    getVendorRisksById,
    getVendorNotesById,
    postVendorNote
} = require('../controllers');

const vendorsRouter = require('express').Router();

vendorsRouter.route('/')
    .get(getVendors)
    .post(postVendor)

vendorsRouter.route('/:vendor_id')
    .get(getVendorById)
    .patch(patchVendor)
    .delete(deleteVendor)

vendorsRouter.route('/:vendor_id/risks')
    .get(getVendorRisksById)

vendorsRouter.route('/:vendor_id/notes')
    .get(getVendorNotesById)
    .post(postVendorNote)

module.exports = vendorsRouter;