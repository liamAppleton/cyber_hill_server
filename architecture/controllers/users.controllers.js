const usersModels = require('../models/users.models');

const getUsers = (req, res, next) => {
    usersModels.fetchUsers()
        .then((users) => res.status(200).send({ users }))
        .catch(next);
};

const getUserById = (req, res, next) => {
    const userId = Number(req.params.id);
    if (!Number.isSafeInteger(userId) || userId < 1) {
        return res.status(400).send({ error: 'id must be a positive integer.' });
    }

    return usersModels.fetchUserById(userId)
        .then((user) => {
            if (!user) return res.status(404).send({ error: 'User not found.' });
            return res.status(200).send({ user });
        })
        .catch(next);
};

const patchUserById = (req, res, next) => {
    const userId = Number(req.params.id);
    if (!Number.isSafeInteger(userId) || userId < 1) {
        return res.status(400).send({ error: 'id must be a positive integer.' });
    }

    if (userId !== Number(req.user.user_id)) {
        return res.status(403).send({ error: 'You can only update your own account.' });
    }

    const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body)
        ? req.body
        : {};
    const bodyKeys = Object.keys(body);

    if (bodyKeys.length !== 1 || bodyKeys[0] !== 'username') {
        return res.status(400).send({
            error: 'Only the username field can be updated here.'
        });
    }

    if (typeof body.username !== 'string') {
        return res.status(400).send({ error: 'username must be a string.' });
    }

    const username = body.username.trim();
    if (
        username.length < 3 ||
        username.length > 100 ||
        !/^[\p{L}\p{N}._-]+$/u.test(username)
    ) {
        return res.status(400).send({
            error: 'username must be 3-100 characters and use only letters, numbers, periods, underscores, or hyphens.'
        });
    }

    return usersModels.updateUsernameById(userId, username)
        .then((user) => res.status(200).send({ user }))
        .catch((error) => {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).send({ error: 'That username is already in use.' });
            }
            return next(error);
        });
};

module.exports = {
    getUsers,
    getUserById,
    patchUserById
};
