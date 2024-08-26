const Game = require('../models/Game');
const { generateStory, processAction, getAvailableModels } = require('../utils/aiUtils');

exports.startNewGame = async (req, res) => {
  try {
    const { aiModel } = req.body;
    const userId = req.user ? req.user.id : null; // We'll implement authentication middleware later
    
    const initialStory = await generateStory(aiModel);
    
    const newGame = await Game.create({
      title: initialStory.title,
      fullStory: initialStory.fullStory,
      lastChunk: initialStory.newChunk,
      options: initialStory.options,
      gameState: initialStory.gameState,
      conversationHistory: initialStory.conversationHistory,
      aiModel,
      userId
    });

    res.status(201).json(newGame);
  } catch (error) {
    console.error('Error starting new game:', error);
    res.status(500).json({ message: 'Error starting new game', error: error.toString() });
  }
};

exports.continueGame = async (req, res) => {
  try {
    const game = await Game.findByPk(req.params.id);
    if (!game) {
      return res.status(404).json({
        message: 'Game not found'
      });
    }
    res.json(game);
  } catch (error) {
    console.error('Error continuing game:', error);
    res.status(500).json({
      message: 'Error continuing game',
      error
    });
  }
};

exports.submitAction = async (req, res) => {
  try {
    const game = await Game.findByPk(req.params.id);
    if (!game) {
      return res.status(404).json({
        message: 'Game not found'
      });
    }
    const {
      action
    } = req.body;
    const startTime = Date.now();
    const nextSegment = await processAction(game.gameState, action, game.conversationHistory);
    const endTime = Date.now();
    const loadTime = endTime - startTime;

    game.fullStory = nextSegment.fullStory;
    game.lastChunk = nextSegment.newChunk;
    game.options = nextSegment.options;
    game.gameState = nextSegment.gameState;
    game.conversationHistory.push({
      type: 'user',
      content: action
    }, {
      type: 'ai',
      content: nextSegment.newChunk
    });
    await game.save();

    res.json({
      ...game.toJSON(),
      loadTime
    });
  } catch (error) {
    console.error('Error processing action:', error);
    res.status(500).json({
      message: 'Error processing action',
      error
    });
  }
};

exports.getUserGames = async (req, res) => {
  try {
    const userId = req.user.id; // We'll implement authentication middleware later
    const games = await Game.findAll({
      where: { userId },
      attributes: ['id', 'title', 'createdAt', 'aiModel'],
      order: [['createdAt', 'DESC']]
    });
    res.json(games);
  } catch (error) {
    console.error('Error fetching user games:', error);
    res.status(500).json({ message: 'Error fetching user games', error: error.toString() });
  }
};

exports.getAvailableModels = (req, res) => {
  const models = getAvailableModels();
  res.json(models);
};