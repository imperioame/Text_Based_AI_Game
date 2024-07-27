const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { sequelize, connectWithRetry } = require('./config/database');
const dotenv = require('dotenv');
const gameRoutes = require('./routes/gameRoutes');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const startServer = async () => {
  await connectWithRetry();
  
  try {
    await sequelize.authenticate();
    console.log('Database connected');
    await sequelize.sync();
    console.log('Database synchronized');

    app.use(express.json());
    app.use('/api/game', gameRoutes);

    io.on('connection', (socket) => {
      console.log('New client connected');
      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

startServer();