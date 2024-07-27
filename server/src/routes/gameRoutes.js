const express = require('express');
const { startNewGame, continueGame, submitAction } = require('../controllers/gameController');

const router = express.Router();

router.post('/new', startNewGame);
router.get('/:id', continueGame);
router.post('/:id/action', submitAction);

module.exports = router;