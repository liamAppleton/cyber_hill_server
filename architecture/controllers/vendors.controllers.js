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

// Sends validation/not-found errors as JSON and maps duplicate vendor names to 409.
const handleError = (err, res, next) => {
    if (err?.code === 'ER_DUP_ENTRY') {
        return res.status(409).send({ error: 'A vendor with that name already exists.' });
    }
    if (err?.status) return res.status(err.status).send({ error: err.message });
    return next(err);
};

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
            if (!vendor) return res.status(404).send({ error: 'Vendor not found.' });
            res.status(200).send({ vendor })
        })
        .catch(next)
}

const postVendor = (req, res, next) => {
    const { name, function: vendorFunction, criticality, holds_pii, system_access, it_supplier } = req.body;

    addVendor({ name, function: vendorFunction, criticality, holds_pii, system_access, it_supplier })
        .then((vendor) => {
            res.status(201).send({ vendor })
        })
        .catch((err) => handleError(err, res, next))
}

const patchVendor = (req, res, next) => {
    const { vendor_id } = req.params;
    const updates = req.body;

    updateVendor(vendor_id, updates)
        .then((vendor) => {
            res.status(200).send({ vendor })
        })
        .catch((err) => handleError(err, res, next))
}

const deleteVendor = (req, res, next) => {
    const { vendor_id } = req.params;

    removeVendor(vendor_id)
        .then((affected) => {
            if (!affected) return res.status(404).send({ error: 'Vendor not found.' });
            res.status(204).send()
        })
        .catch(next)
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
    const body = typeof req.body?.body === 'string' ? req.body.body.trim() : '';

    if (!body) return res.status(400).send({ error: 'Note body is required.' });

    addVendorNote({ vendor_id, body, user_id: req.user.user_id })
        .then((vendor_note) => {
            res.status(201).send({ vendor_note })
        })
        .catch(next)
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