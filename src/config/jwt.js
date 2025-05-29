require('dotenv').config();

module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production',
  jwtExpire: process.env.JWT_EXPIRE || '15m',
  jwtRefreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d',
  jwtIssuer: process.env.JWT_ISSUER || 'express-ecom-api',
  jwtAudience: process.env.JWT_AUDIENCE || 'express-ecom-client',
  
  // JWT Options
  options: {
    issuer: process.env.JWT_ISSUER || 'express-ecom-api',
    audience: process.env.JWT_AUDIENCE || 'express-ecom-client',
    algorithm: 'HS256'
  },

  // Cookie settings for refresh token
  refreshTokenCookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
};