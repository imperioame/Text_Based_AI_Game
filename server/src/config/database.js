const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');

const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;

console.log('Attempting to connect to database:', dbHost); // Add this line for debugging

const connectWithRetry = async () => {
  let retries = 5;
  while (retries) {
    try {
      const connection = await mysql.createConnection({
        host: dbHost,
        user: dbUser,
        password: dbPassword,
      });
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
      console.log('Database created or already exists');
      connection.end();
      break;
    } catch (err) {
      console.log(`Failed to connect to database (${retries} retries left):`, err);
      retries -= 1;
      await new Promise(res => setTimeout(res, 5000));
    }
  }
};

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  dialect: 'mysql',
  logging: process.env.NODE_ENV !== 'production',
});

const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: process.env.NODE_ENV !== 'production' });
    console.log('Database synced successfully');
  } catch (error) {
    console.error('Error syncing database:', error);
  }
};

module.exports = { sequelize, connectWithRetry, syncDatabase };