// server/src/index.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const sequelize = require('./config/database');
const dotenv = require('dotenv');
const gameRoutes = require('./routes/gameRoutes');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

sequelize.sync()
  .then(() => console.log('Database connected'))
  .catch(err => console.error('Database connection error:', err));

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