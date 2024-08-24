const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Game = sequelize.define('Game', {
  fullStory: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  lastChunk: {
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
  conversationHistory: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [], // Initialize with an empty array
  },
});

module.exports = Game;
