const fetch = require('node-fetch');
global.fetch = fetch;

const express = require('express');
const { sequelize, connectWithRetry } = require('./config/database');
const gameRoutes = require('./routes/gameRoutes');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/game', gameRoutes);

const startServer = async () => {
  await connectWithRetry();
  await sequelize.sync();
  app.listen(5000, () => {
    console.log('Server running on port 5000');
  });
};

startServer();
