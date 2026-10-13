const {
    getUsers
} = require('../controllers');

const usersRouter = require('express').Router();

usersRouter.route('/').get(getUsers);

module.exports = usersRouter;