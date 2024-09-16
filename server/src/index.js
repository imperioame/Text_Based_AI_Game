const fetch = require('node-fetch');
global.fetch = fetch;

const express = require('express');
const { sequelize, connectWithRetry } = require('./config/database');
const gameRoutes = require('./routes/gameRoutes');
const userRoutes = require('./routes/userRoutes');
const cors = require('cors');

const setupServer = async (app) => {
  app.use(cors());
  app.use(express.json());

  app.use('/api/game', gameRoutes);
  app.use('/api/user', userRoutes);

  try {
    await connectWithRetry();
    await sequelize.sync({ alter: process.env.NODE_ENV !== 'production' });
    console.log('Database synced successfully');
  } catch (error) {
    console.error('Error setting up server:', error);
    throw error; // rethrow the error to be handled by the caller
  }
};

// If this file is run directly (not imported), start the server
if (require.main === module) {
  const app = express();
  setupServer(app).then(() => {
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  }).catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}

module.exports = setupServer;