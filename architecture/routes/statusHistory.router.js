const {
    getStatusHistory
} = require('../controllers');

const statusHistoryRouter = require('express').Router();

statusHistoryRouter.route('/')
    .get(getStatusHistory)

module.exports = statusHistoryRouter;