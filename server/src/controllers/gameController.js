// server/src/controllers/gameController.js
const Game = require('../models/Game');
const { generateStory, processAction } = require('../utils/aiUtils');

exports.startNewGame = async (req, res) => {
  try {
    const initialStory = await generateStory();
    const newGame = new Game({
      userId: req.body.userId,
      story: initialStory.story,
      options: initialStory.options,
      gameState: initialStory.gameState,
    });
    await newGame.save();
    res.status(201).json(newGame);
  } catch (error) {
    res.status(500).json({ message: 'Error starting new game', error });
  }
};

exports.continueGame = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    res.json(game);
  } catch (error) {
    res.status(500).json({ message: 'Error continuing game', error });
  }
};

exports.submitAction = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    const { action } = req.body;
    const nextSegment = await processAction(game.gameState, action);
    game.story += '\n\n' + nextSegment.story;
    game.options = nextSegment.options;
    game.gameState = nextSegment.gameState;
    game.updatedAt = Date.now();
    await game.save();
    res.json(game);
  } catch (error) {
    res.status(500).json({ message: 'Error processing action', error });
  }
};