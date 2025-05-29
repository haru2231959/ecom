const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const userRoutes = require('./users');
const categoryRoutes = require('./categories');
const productRoutes = require('./products');
const orderRoutes = require('./orders');

// Import middleware
const { common } = require('../../../middlewares');

/**
 * Apply common middleware to all API routes
 */
router.use(common.api);

/**
 * Authentication Routes
 */
router.use('/auth', authRoutes);

/**
 * User Routes
 */
router.use('/users', userRoutes);

/**
 * Category Routes
 */
router.use('/categories', categoryRoutes);

/**
 * Product Routes
 */
router.use('/products', productRoutes);

/**
 * Order Routes
 */
router.use('/orders', orderRoutes);

/**
 * API v1 Info
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Express E-commerce API v1',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      categories: '/api/v1/categories',
      products: '/api/v1/products',
      orders: '/api/v1/orders'
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;