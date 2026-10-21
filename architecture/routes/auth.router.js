const express = require('express');
const {
    register,
    login,
    logout,
    getCurrentUser,
    changePassword
} = require('../controllers/auth.controllers');
const { requireAuth } = require('../middleware/require-auth');

const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.get('/me', requireAuth, getCurrentUser);
authRouter.patch('/password', requireAuth, changePassword);

module.exports = authRouter;
