const Game = require('../models/Game');
const { generateStory, processAction, getAvailableModels } = require('../utils/aiUtils');
const { v4: uuidv4 } = require('uuid');

exports.startNewGame = async (req, res) => {
  try {
    const { aiModel } = req.body;
    const userId = req.user ? req.user.id : null;
    const publicId = uuidv4(); // Generate a unique public ID for the game
    
    const initialStory = await generateStory(aiModel);
    
    const newGame = await Game.create({
      title: initialStory.title,
      fullStory: initialStory.fullStory,
      lastChunk: initialStory.newChunk,
      options: initialStory.options,
      gameState: initialStory.gameState,
      conversationHistory: initialStory.conversationHistory,
      aiModel,
      userId,
      publicId
    });

    res.status(201).json({
      id: newGame.publicId,
      title: newGame.title,
      lastChunk: newGame.lastChunk,
      options: newGame.options
    });
  } catch (error) {
    console.error('Error starting new game:', error);
    res.status(500).json({ message: 'Error starting new game', error: error.toString() });
  }
};

exports.continueGame = async (req, res) => {
  try {
    const game = await Game.findOne({ where: { publicId: req.params.id } });
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    
    // If the game belongs to a user, ensure the correct user is accessing it
    if (game.userId && (!req.user || game.userId !== req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json({
      id: game.publicId,
      title: game.title,
      lastChunk: game.lastChunk,
      options: game.options
    });
  } catch (error) {
    console.error('Error continuing game:', error);
    res.status(500).json({ message: 'Error continuing game', error: error.toString() });
  }
};

exports.submitAction = async (req, res) => {
  try {
    const game = await Game.findOne({ where: { publicId: req.params.id } });
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    
    // If the game belongs to a user, ensure the correct user is accessing it
    if (game.userId && (!req.user || game.userId !== req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { action } = req.body;
    const nextSegment = await processAction(game.gameState, action, game.conversationHistory);

    game.fullStory = nextSegment.fullStory;
    game.lastChunk = nextSegment.newChunk;
    game.options = nextSegment.options;
    game.gameState = nextSegment.gameState;
    game.conversationHistory = nextSegment.conversationHistory;
    await game.save();

    res.json({
      id: game.publicId,
      title: game.title,
      lastChunk: game.lastChunk,
      options: game.options
    });
  } catch (error) {
    console.error('Error processing action:', error);
    res.status(500).json({ message: 'Error processing action', error: error.toString() });
  }
};

exports.getUserGames = async (req, res) => {
  try {
    const games = await Game.findAll({
      where: { userId: req.user.id },
      attributes: ['publicId', 'title', 'createdAt', 'aiModel'],
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