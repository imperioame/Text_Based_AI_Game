const express = require('express');
const { registerUser, loginUser, verifyToken } = require('../controllers/userController.js');
const { getUserGames } = require('../controllers/gameController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/verify', authMiddleware, verifyToken);
router.get('/games', authMiddleware, getUserGames);

module.exports = router;