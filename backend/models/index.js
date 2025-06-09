const { Sequelize } = require('sequelize');
require('dotenv').config();

const dbName = process.env.DB_NAME || 'ecommerce';
const dbUser = process.env.DB_USER || 'postgres';
const dbPass = process.env.DB_PASS || 'postgres';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || 5432;
const dbDialect = 'postgres';

// Build connection string (hide password)
const connectionString = `postgres://${dbUser}:****@${dbHost}:${dbPort}/${dbName}`;
console.log('Connecting to DB:', connectionString);

const sequelize = new Sequelize(dbName, dbUser, dbPass, {
  host: dbHost,
  port: dbPort,
  dialect: dbDialect,
  logging: false,
});

// Test connection and log errors
sequelize.authenticate()
  .then(() => {
    sequelize.sync();
    console.log('Database connection has been established successfully.');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

module.exports = sequelize; 