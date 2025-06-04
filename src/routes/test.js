const express = require('express');
const { logger } = require('../utils/logger');
const router = express.Router();

/**
 * @swagger
 * /api/test:
 *   get:
 *     summary: Test API endpoint
 *     description: Simple test endpoint to verify API logging
 *     tags: [Test]
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                 data:
 *                   type: object
 */
router.get('/', (req, res) => {
  logger.info('Test endpoint accessed', {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    query: req.query
  });

  res.json({
    success: true,
    message: 'Test API endpoint working!',
    timestamp: new Date().toISOString(),
    data: {
      method: req.method,
      url: req.originalUrl,
      headers: req.headers,
      query: req.query
    }
  });
});

/**
 * @swagger
 * /api/test/slow:
 *   get:
 *     summary: Slow test endpoint
 *     description: Test endpoint that takes 2 seconds to respond (for performance logging)
 *     tags: [Test]
 *     responses:
 *       200:
 *         description: Success response after delay
 */
router.get('/slow', async (req, res) => {
  logger.info('Slow test endpoint accessed');
  
  // Simulate slow operation
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  res.json({
    success: true,
    message: 'Slow endpoint completed!',
    delay: '2 seconds',
    timestamp: new Date().toISOString()
  });
});

/**
 * @swagger
 * /api/test/error:
 *   get:
 *     summary: Error test endpoint
 *     description: Test endpoint that throws an error (for error logging)
 *     tags: [Test]
 *     responses:
 *       500:
 *         description: Server error
 */
router.get('/error', (req, res) => {
  logger.warn('Error test endpoint accessed - about to throw error');
  throw new Error('This is a test error for logging purposes');
});

/**
 * @swagger
 * /api/test/post:
 *   post:
 *     summary: POST test endpoint
 *     description: Test POST endpoint to verify request body logging
 *     tags: [Test]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success response
 */
router.post('/post', (req, res) => {
  logger.info('POST test endpoint accessed', {
    bodyKeys: Object.keys(req.body),
    bodySize: JSON.stringify(req.body).length
  });

  res.json({
    success: true,
    message: 'POST request received!',
    receivedData: {
      ...req.body,
      password: req.body.password ? '[FILTERED]' : undefined
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * @swagger
 * /api/test/auth:
 *   get:
 *     summary: Auth test endpoint
 *     description: Test endpoint that checks for authorization header
 *     tags: [Test]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success response
 *       401:
 *         description: Unauthorized
 */
router.get('/auth', (req, res) => {
  const authHeader = req.get('Authorization');
  
  if (!authHeader) {
    logger.warn('Auth test endpoint accessed without authorization header');
    return res.status(401).json({
      success: false,
      message: 'Authorization header required',
      timestamp: new Date().toISOString()
    });
  }

  logger.info('Auth test endpoint accessed with authorization header');
  
  res.json({
    success: true,
    message: 'Authorization header received!',
    hasAuth: !!authHeader,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
