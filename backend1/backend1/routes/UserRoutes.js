const express = require('express');
const { protect } = require('../middleware/auth');
const { login, register, getMe } = require('../controllers/UserController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;
