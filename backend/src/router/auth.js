const router = require('express').Router();
const { login, register } = require('../controllers/authController');
const { validate } = require('../validators');
const { registerRule } = require('../validators/auth/register');
const { loginRule } = require('../validators/auth/login');

router.post('/login', [...loginRule, validate], login);

router.post('/register', [...registerRule, validate], register);

module.exports = router;
