#!/usr/bin/env node

/**
 * Health Check Script for Docker Container
 * This script performs a health check on the Express API
 */

const http = require('http');

const options = {
  host: 'localhost',
  port: process.env.PORT || 3000,
  timeout: 2000,
  path: '/health'
};

const request = http.request(options, (response) => {
  console.log(`Health check status: ${response.statusCode}`);
  
  if (response.statusCode === 200) {
    process.exit(0); // Success
  } else {
    process.exit(1); // Failure
  }
});

request.on('error', (error) => {
  console.error('Health check failed:', error.message);
  process.exit(1); // Failure
});

request.on('timeout', () => {
  console.error('Health check timeout');
  request.destroy();
  process.exit(1); // Failure
});

request.setTimeout(options.timeout);
request.end();
