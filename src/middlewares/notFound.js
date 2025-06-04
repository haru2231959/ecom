/**
 * 404 Not Found middleware
 */
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
};

module.exports = notFound;
