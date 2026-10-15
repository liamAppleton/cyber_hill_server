const {
    fetchVendors,
    fetchVendorById,
    addVendor,
    updateVendor,
    removeVendor,
    fetchVendorRisksById,
    fetchVendorNotesById,
    addVendorNote
} = require('../models');

const getVendors = (req, res, next) => {
    fetchVendors()
        .then((vendors) => {
            res.status(200).send({ vendors })
        })
        .catch((err) => {
            next(err)
        })
}

const getVendorById = (req, res, next) => {
    const { vendor_id } = req.params;

    fetchVendorById(vendor_id)
        .then((vendor) => {
            res.status(200).send({ vendor })
        })
        .catch((err) => {
            next(err)
        })
}

const postVendor = (req, res, next) => {
    const { name, function: vendorFunction, criticality, holds_pii, system_access, it_supplier } = req.body;

    addVendor({ name, function: vendorFunction, criticality, holds_pii, system_access, it_supplier })
        .then((vendor) => {
            res.status(201).send({ vendor })
        })
        .catch((err) => {
            next(err)
        })
}

const patchVendor = (req, res, next) => {
    const { vendor_id } = req.params;
    const updates = req.body;

    updateVendor(vendor_id, updates)
        .then((vendor) => {
            res.status(200).send({ vendor })
        })
        .catch((err) => {
            next(err)
        })
}

const deleteVendor = (req, res, next) => {
    const { vendor_id } = req.params;

    removeVendor(vendor_id)
        .then(() => {
            res.status(204).send()
        })
        .catch((err) => {
            next(err)
        })
}

const getVendorRisksById = (req, res, next) => {
    const { vendor_id } = req.params;

    fetchVendorRisksById(vendor_id)
        .then((vendor_risks) => {
            res.status(200).send({ vendor_risks })
        })
        .catch((err) => {
            next(err)
        })
}

const getVendorNotesById = (req, res, next) => {
    const { vendor_id } = req.params;

    fetchVendorNotesById(vendor_id)
        .then((vendor_notes) => {
            res.status(200).send({ vendor_notes })
        })
        .catch((err) => {
            next(err)
        })
}

const postVendorNote = (req, res, next) => {
    const { vendor_id } = req.params;
    const { body, user_id } = req.body;

    addVendorNote({ vendor_id, body, user_id })
        .then((vendor_notes) => {
            res.status(201).send({ vendor_notes })
        })
        .catch((err) => {
            next(err)
        })
}

module.exports = {
    getVendors,
    getVendorById,
    postVendor,
    patchVendor,
    deleteVendor,
    getVendorRisksById,
    getVendorNotesById,
    postVendorNote
}