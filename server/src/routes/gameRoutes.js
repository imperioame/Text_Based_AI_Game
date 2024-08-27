const express = require('express');
const { startNewGame, continueGame, submitAction, getUserGames, getAvailableModels } = require('../controllers/gameController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/new', startNewGame);
router.get('/:id', continueGame);
router.post('/:id/action', submitAction);
router.get('/models', getAvailableModels);

// Route that requires authentication
router.get('/user/games', authMiddleware, getUserGames);

module.exports = router;