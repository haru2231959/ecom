const fs = require('fs');
const path = require('path');
const { logger } = require('../utils/logger');

/**
 * Initialize required directories
 */
const initDirectories = () => {
  const directories = [
    'storage',
    'storage/logs',
    'storage/uploads',
    'storage/uploads/images',
    'storage/uploads/images/thumbnails',
    'storage/uploads/images/processed',
    'storage/uploads/documents',
    'storage/uploads/videos',
    'storage/temp',
    'docs'
  ];

  directories.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      logger.info(`Created directory: ${dir}`);
    }
  });
};

/**
 * Initialize configuration files
 */
const initConfigFiles = () => {
  // Create .sequelizerc if it doesn't exist
  const sequelizerc = path.join(process.cwd(), '.sequelizerc');
  if (!fs.existsSync(sequelizerc)) {
    const content = `const path = require('path');

module.exports = {
  'config': path.resolve('src', 'config', 'database.js'),
  'models-path': path.resolve('src', 'models'),
  'seeders-path': path.resolve('src', 'database', 'seeders'),
  'migrations-path': path.resolve('src', 'database', 'migrations')
};`;
    
    fs.writeFileSync(sequelizerc, content);
    logger.info('Created .sequelizerc file');
  }

  // Create basic swagger.json if it doesn't exist
  const swaggerPath = path.join(process.cwd(), 'docs', 'swagger.json');
  if (!fs.existsSync(swaggerPath)) {
    const swagger = {
      "openapi": "3.0.0",
      "info": {
        "title": "Express E-commerce API",
        "version": "1.0.0",
        "description": "RESTful API for E-commerce application"
      },
      "servers": [
        {
          "url": "http://localhost:3000/api/v1",
          "description": "Development server"
        }
      ],
      "paths": {},
      "components": {
        "securitySchemes": {
          "bearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
          }
        }
      }
    };
    
    fs.writeFileSync(swaggerPath, JSON.stringify(swagger, null, 2));
    logger.info('Created basic swagger.json file');
  }
};

/**
 * Main initialization function
 */
const initializeApp = () => {
  try {
    logger.info('🚀 Initializing application...');
    
    initDirectories();
    initConfigFiles();
    
    logger.info('✅ Application initialized successfully');
  } catch (error) {
    logger.error('❌ Application initialization failed:', error);
    throw error;
  }
};

module.exports = {
  initializeApp,
  initDirectories,
  initConfigFiles
};