const express = require('express');
const setupServer = require('./src/index');

const app = express();

setupServer(app).catch(error => {
  console.error('Failed to set up server:', error);
  process.exit(1);
});

module.exports = app;