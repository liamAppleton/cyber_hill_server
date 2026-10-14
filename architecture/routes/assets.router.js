const {
    getAssets,
    getAssetById,
    postAsset,
    patchAsset,
    getVulnerabilitiesByAssetId,
    deleteAsset
} = require('../controllers');

const assetsRouter = require('express').Router();

assetsRouter.route('/')
    .get(getAssets)
    .post(postAsset)

assetsRouter.route('/:asset_id')
    .get(getAssetById)
    .patch(patchAsset)
    .delete(deleteAsset)

assetsRouter.route('/:asset_id/vulnerabilities')
    .get(getVulnerabilitiesByAssetId)

module.exports = assetsRouter;