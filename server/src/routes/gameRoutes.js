const express = require('express');
const { startNewGame, continueGame, submitAction, getAvailableModels } = require('../controllers/gameController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/new', startNewGame);
router.get('/models', getAvailableModels);
router.get('/:id', continueGame);
router.post('/:id/action', submitAction);

module.exports = router;