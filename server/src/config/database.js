const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
const dns = require('dns').promises;

const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;
console.log('dbName', dbName, 'dbUser', dbUser, 'dbPassword', dbPassword, 'dbHost', dbHost);

const resolveDNS = async (hostname) => {const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
const dns = require('dns').promises;

const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;
console.log('dbName', dbName, 'dbUser', dbUser, 'dbPassword', dbPassword, 'dbHost', dbHost);

const resolveDNS = async (hostname) => {
  try {
    const addresses = await dns.resolve4(hostname);
    console.log(`Resolved ${hostname} to IP address(es):`, addresses);
    return addresses[0]; // Return the first resolved IP address
  } catch (error) {
    console.error(`Failed to resolve DNS for ${hostname}:`, error);
    return hostname; // Return the original hostname if DNS resolution fails
  }
};

const connectWithRetry = async () => {
  let retries = 5;
  const resolvedHost = await resolveDNS(dbHost);
  
  while (retries) {
    try {
      console.log(`Attempting to connect to database host: ${resolvedHost}`);
      const connection = await mysql.createConnection({
        host: resolvedHost,
        user: dbUser,
        password: dbPassword,
        connectTimeout: 10000, // 10 seconds
      });
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
      console.log('Database created or already exists');
      connection.end();
      break;
    } catch (err) {
      console.log(`Failed to connect to database (${retries} retries left):`, err);
      console.log('Error details:', err.message);
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
  try {
    const addresses = await dns.resolve4(hostname);
    console.log(`Resolved ${hostname} to IP address(es):`, addresses);
    return addresses[0]; // Return the first resolved IP address
  } catch (error) {
    console.error(`Failed to resolve DNS for ${hostname}:`, error);
    return hostname; // Return the original hostname if DNS resolution fails
  }
};

const connectWithRetry = async () => {
  let retries = 5;
  const resolvedHost = await resolveDNS(dbHost);
  
  while (retries) {
    try {
      console.log(`Attempting to connect to database host: ${resolvedHost}`);
      const connection = await mysql.createConnection({
        host: resolvedHost,
        user: dbUser,
        password: dbPassword,
      });
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
      console.log('Database created or already exists');
      connection.end();
      break;
    } catch (err) {
      console.log(`Failed to connect to database (${retries} retries left):`, err);
      console.log('Error details:', err.message);
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