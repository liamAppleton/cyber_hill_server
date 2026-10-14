const {
    fetchAssets,
    fetchAssetById,
    addAsset,
    updateAsset,
    fetchVulnerabilitiesByAssetId,
    removeAsset
} = require('../models');

const getAssets = (req, res, next) => {
    fetchAssets()
        .then((assets) => {
            res.status(200).send({ assets });
        })
        .catch((err) => {
            next(err)
        });
};

const getAssetById = (req, res, next) => {
    const { asset_id } = req.params;

    fetchAssetById(asset_id)
        .then((asset) => {
            res.status(200).send({ asset })
        })
    .catch((err) => {
        next(err);
    });
};

const postAsset = (req, res, next) => {
    const { asset_name, asset_type } = req.body;

    addAsset({asset_name, asset_type})
        .then((asset) => {
            res.status(201).send({ asset })
        })
        .catch((err) => {
            next(err)
        })
}

const patchAsset = (req, res, next) => {
    const { asset_id } = req.params;
    const { asset_name, asset_type } = req.body;

    updateAsset({ asset_id, asset_name, asset_type })
        .then((asset) => {
            res.status(200).send({ asset })
        })
        .catch((err) => {
            next(err)
        })
}

const getVulnerabilitiesByAssetId = (req, res, next) => {
    const { asset_id } = req.params;

    fetchVulnerabilitiesByAssetId(asset_id)
        .then((vulnerabilities) => {
            res.status(200).send({ vulnerabilities });
        })
        .catch(next);
};

const deleteAsset = (req, res, next) => {
    const { asset_id } = req.params;

    removeAsset(asset_id)
        .then(() => {
            res.status(204).send();
        })
        .catch((err) => {
            next(err)
        })
}

module.exports = {
    getAssets,
    getAssetById,
    postAsset,
    patchAsset,
    getVulnerabilitiesByAssetId,
    deleteAsset
};