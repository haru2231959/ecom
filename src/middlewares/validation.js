const Joi = require('joi');
const { ApiResponse } = require('../utils/response');
const { logger } = require('../utils/logger');

/**
 * Validation Middleware Factory
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const dataToValidate = req[property];
    
    if (!dataToValidate) {
      return res.status(400).json(
        ApiResponse.badRequest(`No ${property} data provided`)
      );
    }

    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      logger.warn('Validation Error:', {
        url: req.originalUrl,
        method: req.method,
        errors: errors,
        userId: req.user ? req.user.id : null
      });

      return res.status(422).json(
        ApiResponse.validationError('Validation failed', errors)
      );
    }

    req[property] = value;
    next();
  };
};

/**
 * Custom Joi Extensions
 */
const password = Joi.string()
  .min(8)
  .max(128)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  .message('Password must contain at least 8 characters with uppercase, lowercase, number and special character');

const email = Joi.string()
  .email({ minDomainSegments: 2 })
  .lowercase()
  .max(100);

const phone = Joi.string()
  .pattern(/^(\+84|84|0)(3|5|7|8|9)[0-9]{8}$/)
  .message('Phone number must be a valid Vietnamese phone number');

/**
 * Common Validation Schemas
 */
const idParam = Joi.object({
  id: Joi.number().integer().positive().required()
});

const pagination = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sort: Joi.string().default('createdAt'),
  order: Joi.string().valid('asc', 'desc', 'ASC', 'DESC').default('desc')
});

/**
 * Sanitization Middleware
 */
const sanitize = (req, res, next) => {
  const sanitizeValue = (value) => {
    if (typeof value === 'string') {
      return value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim();
    }
    if (typeof value === 'object' && value !== null) {
      Object.keys(value).forEach(key => {
        value[key] = sanitizeValue(value[key]);
      });
    }
    return value;
  };

  if (req.body) req.body = sanitizeValue(req.body);
  if (req.query) req.query = sanitizeValue(req.query);
  if (req.params) req.params = sanitizeValue(req.params);

  next();
};

module.exports = {
  validate,
  password,
  email,
  phone,
  idParam,
  pagination,
  sanitize,
  Joi
};