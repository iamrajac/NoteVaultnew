const express = require('express');
const { register, login, forgotPassword, inviteUser, registerWithInvite } = require('../controllers/auth');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/invite', inviteUser);
router.post('/register-invite', registerWithInvite);

module.exports = router;
