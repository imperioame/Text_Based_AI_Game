const express = require('express');
const rateLimit = require('express-rate-limit');
const { 
  startNewGame, 
  continueGame, 
  submitAction, 
  getAvailableModels, 
  associateGameWithUser 
} = require('../controllers/gameController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Rate limiting middleware
const apiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });
  
  const newGameLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // limit each IP to 5 new game requests per minute
    standardHeaders: true,
    legacyHeaders: false,
  });
  
  const actionLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // limit each IP to 20 actions per minute
    standardHeaders: true,
    legacyHeaders: false,
  });
  
  // Apply rate limiting to all routes
  router.use(apiLimiter);
  
  // Public routes
  router.post('/new', newGameLimiter, startNewGame);
  router.get('/models', getAvailableModels);
  router.get('/:id', continueGame);
  router.post('/:id/action', actionLimiter, submitAction);
  
  // Protected routes
  router.post('/:gameId/associate', authMiddleware, associateGameWithUser);

  module.exports = router;