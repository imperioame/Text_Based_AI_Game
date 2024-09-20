require('dotenv').config();
const express = require('express');
const setupServer = require('./src/index');

const app = express();

setupServer(app).catch(error => {
  console.error('Failed to set up server:', error);
  // Log any additional error details
  if (error.stack) {
    console.error('Error stack:', error.stack);
  }
  process.exit(1);
});

module.exports = app;