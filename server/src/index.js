const fetch = require('node-fetch');
global.fetch = fetch;

const express = require('express');
const { sequelize, connectWithRetry } = require('./config/database');
const gameRoutes = require('./routes/gameRoutes');
const userRoutes = require('./routes/userRoutes');
const cors = require('cors');

const setupServer = async (app) => {
  // Trust proxy
  app.set('trust proxy', 1);

  const corsOptions = {
  origin: ['http://ai-text-game.marioa.me', 'http://www.ai-text-game.marioa.me'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  };

  app.use(cors(corsOptions));
  app.use(express.json());

  app.use('/api/game', gameRoutes);
  app.use('/api/user', userRoutes);
  // add /test route with test method with a console.log
  app.get('/api/test', (req, res) => {
    console.log('Test route hit');
    res.send('Test route hit');
  });

  try {
    console.log('Attempting to connect to the database...');
    await connectWithRetry();
    console.log('Database connection established successfully');

    console.log('Syncing database schema...');
    await sequelize.sync({ alter: process.env.NODE_ENV !== 'production' });
    console.log('Database synced successfully');

    const port = process.env.PORT || 8080;
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });

  } catch (error) {
    console.error('Error setting up server:', error);
    if (error.original) {
      console.error('Original error:', error.original);
    }
    throw error; // rethrow the error to be handled by the caller
  }
};

// If this file is run directly (not imported), start the server
if (require.main === module) {
  const app = express();
  setupServer(app).then(() => {
    const port = process.env.PORT || 8080;
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  }).catch(error => {
    console.error('Failed to start server:', error);
    if (error.stack) {
      console.error('Error stack:', error.stack);
    }
    process.exit(1);
  });
}

module.exports = setupServer;