const {
    getUsers,
    getUserById,
    patchUserById
} = require('../controllers/users.controllers');

const usersRouter = require('express').Router();

usersRouter.route('/').get(getUsers);
usersRouter.route('/:id')
    .get(getUserById)
    .patch(patchUserById);

module.exports = usersRouter;