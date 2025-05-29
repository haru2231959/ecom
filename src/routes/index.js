const express = require('express');
const router = express.Router();

// Import API routes
const apiV1Routes = require('./api/v1');

// Import webhook routes
// const webhookRoutes = require('./webhooks');

/**
 * API Routes
 */
router.use('/v1', apiV1Routes);

// Future API versions
// router.use('/v2', apiV2Routes);

/**
 * Webhook Routes
 */
// router.use('/webhooks', webhookRoutes);

/**
 * Default API info
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Express E-commerce API',
    version: '1.0.0',
    endpoints: {
      v1: '/api/v1',
      health: '/health',
      docs: process.env.NODE_ENV !== 'production' ? '/api-docs' : null
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;