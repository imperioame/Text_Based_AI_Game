const Game = require('../models/Game');
const { generateStory, processAction } = require('../utils/aiUtils');

exports.startNewGame = async (req, res) => {
  try {
    const initialStory = await generateStory();
    const newGame = await Game.create({
      story: initialStory.story,
      options: initialStory.options,
      gameState: initialStory.gameState,
    });
    res.status(201).json(newGame);
  } catch (error) {
    console.error('Error starting new game:', error);
    res.status(500).json({ message: 'Error starting new game', error });
  }
};

exports.continueGame = async (req, res) => {
  try {
    const game = await Game.findByPk(req.params.id);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    res.json(game);
  } catch (error) {
    console.error('Error continuing game:', error);
    res.status(500).json({ message: 'Error continuing game', error });
  }
};

exports.submitAction = async (req, res) => {
  try {
    const game = await Game.findByPk(req.params.id);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    const { action } = req.body;
    const nextSegment = await processAction(game.gameState, action);
    game.story += '\n\n' + nextSegment.story;
    game.options = nextSegment.options;
    game.gameState = nextSegment.gameState;
    await game.save();
    res.json(game);
  } catch (error) {
    console.error('Error processing action:', error);
    res.status(500).json({ message: 'Error processing action', error });
  }
};
