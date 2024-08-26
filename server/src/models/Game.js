const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Game = sequelize.define('Game', {
  title: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  fullStory: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  lastChunk: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  options: {
    type: DataTypes.JSON,
    allowNull: false
  },
  gameState: {
    type: DataTypes.JSON,
    allowNull: false
  },
  conversationHistory: {
    type: DataTypes.JSON,
    allowNull: false
  },
  aiModel: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'Games'
});

module.exports = Game;