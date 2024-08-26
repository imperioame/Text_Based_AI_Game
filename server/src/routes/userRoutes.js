const express = require('express');
const { registerUser, loginUser } = require('../controllers/userController.js');
const authMiddleware = require('../middleware/authMiddleware');


const router = express.Router();

router.post('/register', authMiddleware, registerUser);
router.post('/login', authMiddleware, loginUser);

module.exports = router;