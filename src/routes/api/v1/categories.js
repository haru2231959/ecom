const express = require('express');
const router = express.Router();
const { authenticate, adminOnly, validate, cache } = require('../../../middlewares');

// Mock category controller
const categoryController = {
  getCategories: (req, res) => {
    res.json({
      success: true,
      message: 'Categories retrieved successfully',
      data: [
        { id: 1, name: 'Electronics', slug: 'electronics', description: 'Electronic devices' },
        { id: 2, name: 'Clothing', slug: 'clothing', description: 'Fashion items' },
        { id: 3, name: 'Books', slug: 'books', description: 'Books and magazines' }
      ]
    });
  },
  
  getCategoryById: (req, res) => {
    res.json({
      success: true,
      message: 'Category retrieved successfully',
      data: { 
        id: parseInt(req.params.id), 
        name: 'Electronics', 
        slug: 'electronics',
        description: 'Electronic devices'
      }
    });
  },
  
  createCategory: (req, res) => {
    res.json({
      success: true,
      message: 'Category created successfully',
      data: { 
        id: Date.now(), 
        ...req.body,
        slug: req.body.name.toLowerCase().replace(/\s+/g, '-')
      }
    });
  },
  
  updateCategory: (req, res) => {
    res.json({
      success: true,
      message: 'Category updated successfully',
      data: { 
        id: parseInt(req.params.id), 
        ...req.body 
      }
    });
  },
  
  deleteCategory: (req, res) => {
    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  }
};

// Validation schemas
const createCategorySchema = validate.Joi.object({
  name: validate.Joi.string().min(2).max(100).required(),
  description: validate.Joi.string().max(500).optional(),
  parentId: validate.Joi.number().integer().optional(),
  sortOrder: validate.Joi.number().integer().min(0).optional()
});

const updateCategorySchema = validate.Joi.object({
  name: validate.Joi.string().min(2).max(100).optional(),
  description: validate.Joi.string().max(500).optional(),
  parentId: validate.Joi.number().integer().optional(),
  sortOrder: validate.Joi.number().integer().min(0).optional(),
  isActive: validate.Joi.boolean().optional()
});

/**
 * @route   GET /api/v1/categories
 * @desc    Get all categories
 * @access  Public
 */
router.get('/',
  cache.apiCache(1800), // 30 minutes cache
  categoryController.getCategories
);

/**
 * @route   GET /api/v1/categories/:id
 * @desc    Get category by ID
 * @access  Public
 */
router.get('/:id',
  validate(validate.idParam, 'params'),
  cache.apiCache(1800),
  categoryController.getCategoryById
);

/**
 * @route   POST /api/v1/categories
 * @desc    Create new category (Admin only)
 * @access  Private/Admin
 */
router.post('/',
  authenticate,
  adminOnly,
  validate(createCategorySchema),
  cache.invalidateCache(['categories', 'api']),
  categoryController.createCategory
);

/**
 * @route   PUT /api/v1/categories/:id
 * @desc    Update category (Admin only)
 * @access  Private/Admin
 */
router.put('/:id',
  authenticate,
  adminOnly,
  validate(validate.idParam, 'params'),
  validate(updateCategorySchema),
  cache.invalidateCache(['categories', 'api']),
  categoryController.updateCategory
);

/**
 * @route   DELETE /api/v1/categories/:id
 * @desc    Delete category (Admin only)
 * @access  Private/Admin
 */
router.delete('/:id',
  authenticate,
  adminOnly,
  validate(validate.idParam, 'params'),
  cache.invalidateCache(['categories', 'api']),
  categoryController.deleteCategory
);

module.exports = router;