const { getEndpoints } = require('../controllers')

const endpointsRouter = require('express').Router();

endpointsRouter.route('/').get(getEndpoints);

module.exports = endpointsRouter;