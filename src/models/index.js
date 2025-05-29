const { Sequelize } = require('sequelize');
const config = require('../config/database');
const { logger } = require('../utils/logger');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Initialize Sequelize
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    ...dbConfig,
    logging: (sql, timing) => {
      if (dbConfig.logging) {
        logger.logQuery(sql, timing);
      }
    }
  }
);

const db = {};

// Import models
db.User = require('./User')(sequelize, Sequelize.DataTypes);
db.Category = require('./Category')(sequelize, Sequelize.DataTypes);
db.Product = require('./Product')(sequelize, Sequelize.DataTypes);
db.Order = require('./Order')(sequelize, Sequelize.DataTypes);
db.OrderItem = require('./OrderItem')(sequelize, Sequelize.DataTypes);
db.RefreshToken = require('./RefreshToken')(sequelize, Sequelize.DataTypes);

// Setup model associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Add Sequelize instance and constructor to db object
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully');
  } catch (error) {
    logger.error('Unable to connect to database:', error);
    throw error;
  }
};

// Sync database (use with caution in production)
const syncDatabase = async (options = {}) => {
  try {
    await sequelize.sync(options);
    logger.info('Database synchronized successfully');
  } catch (error) {
    logger.error('Database synchronization failed:', error);
    throw error;
  }
};

// Close database connections
const closeConnection = async () => {
  try {
    await sequelize.close();
    logger.info('Database connections closed successfully');
  } catch (error) {
    logger.error('Error closing database connections:', error);
    throw error;
  }
};

// Export database utilities
db.testConnection = testConnection;
db.syncDatabase = syncDatabase;
db.closeConnection = closeConnection;

module.exports = db;