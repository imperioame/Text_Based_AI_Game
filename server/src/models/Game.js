// server/src/models/Game.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Game = sequelize.define('Game', {
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  story: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  options: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  gameState: {
    type: DataTypes.JSON,
    allowNull: false,
  },
});

module.exports = Game;