const express = require('express');
const { startNewGame, continueGame, submitAction, getUserGames, getAvailableModels } = require('../controllers/gameController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/new', authMiddleware, startNewGame);
router.get('/:id', authMiddleware, continueGame);
router.post('/:id/action', authMiddleware, submitAction);
router.get('/user/games', authMiddleware, getUserGames);
router.get('/models', getAvailableModels);

module.exports = router;