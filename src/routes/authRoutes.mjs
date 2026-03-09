const router = require('express').Router();
const { register, login } = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middlewares/validate');

// POST /api/auth/register
router.post('/register', validateRegister, register);

// POST /api/auth/login
router.post('/login', validateLogin, login);

module.exports = router;
