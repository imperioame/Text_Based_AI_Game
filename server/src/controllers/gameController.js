const Game = require('../models/Game');
const { generateStory, processAction } = require('../utils/aiUtils');

exports.startNewGame = async (req, res) => {
  try {
    const initialStory = await generateStory();
    const newGame = await Game.create({
      fullStory: initialStory.fullStory,
      lastChunk: initialStory.newChunk,
      options: initialStory.options,
      gameState: initialStory.gameState,
      conversationHistory: [{ type: 'ai', content: initialStory.newChunk }]
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
    const startTime = Date.now();
    const nextSegment = await processAction(game.gameState, action, game.conversationHistory);
    const endTime = Date.now();
    const loadTime = endTime - startTime;

    game.fullStory = nextSegment.fullStory;
    game.lastChunk = nextSegment.newChunk;
    game.options = nextSegment.options;
    game.gameState = nextSegment.gameState;
    game.conversationHistory.push(
      { type: 'user', content: action },
      { type: 'ai', content: nextSegment.newChunk }
    );
    await game.save();

    res.json({
      ...game.toJSON(),
      loadTime
    });
  } catch (error) {
    console.error('Error processing action:', error);
    res.status(500).json({ message: 'Error processing action', error });
  }
};