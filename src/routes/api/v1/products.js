const express = require('express');
const router = express.Router();
const { authenticate, adminOnly, validate, cache } = require('../../../middlewares');

// Mock product controller
const productController = {
  getProducts: (req, res) => {
    res.json({
      success: true,
      message: 'Products retrieved successfully',
      data: [
        { 
          id: 1, 
          name: 'iPhone 15', 
          slug: 'iphone-15',
          price: 999.00,
          salePrice: 899.00,
          stockQuantity: 50,
          categoryId: 1,
          status: 'active'
        },
        { 
          id: 2, 
          name: 'Samsung Galaxy S24', 
          slug: 'samsung-galaxy-s24',
          price: 799.00,
          stockQuantity: 30,
          categoryId: 1,
          status: 'active'
        }
      ],
      pagination: {
        currentPage: parseInt(req.query.page) || 1,
        totalPages: 1,
        totalItems: 2,
        itemsPerPage: parseInt(req.query.limit) || 20
      }
    });
  },
  
  getProductById: (req, res) => {
    res.json({
      success: true,
      message: 'Product retrieved successfully',
      data: { 
        id: parseInt(req.params.id), 
        name: 'iPhone 15', 
        slug: 'iphone-15',
        description: 'Latest iPhone with advanced features',
        price: 999.00,
        salePrice: 899.00,
        stockQuantity: 50,
        categoryId: 1,
        status: 'active',
        images: ['/uploads/iphone-15-1.jpg', '/uploads/iphone-15-2.jpg']
      }
    });
  },
  
  createProduct: (req, res) => {
    res.json({
      success: true,
      message: 'Product created successfully',
      data: { 
        id: Date.now(), 
        ...req.body,
        slug: req.body.name.toLowerCase().replace(/\s+/g, '-'),
        status: 'active'
      }
    });
  },
  
  updateProduct: (req, res) => {
    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { 
        id: parseInt(req.params.id), 
        ...req.body 
      }
    });
  },
  
  deleteProduct: (req, res) => {
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  },
  
  searchProducts: (req, res) => {
    res.json({
      success: true,
      message: 'Products search completed',
      data: [
        { 
          id: 1, 
          name: 'iPhone 15', 
          slug: 'iphone-15',
          price: 999.00,
          salePrice: 899.00,
          stockQuantity: 50
        }
      ],
      query: req.query.q,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 1,
        itemsPerPage: 20
      }
    });
  },
  
  getFeaturedProducts: (req, res) => {
    res.json({
      success: true,
      message: 'Featured products retrieved successfully',
      data: [
        { 
          id: 1, 
          name: 'iPhone 15', 
          slug: 'iphone-15',
          price: 999.00,
          salePrice: 899.00,
          featured: true
        }
      ]
    });
  }
};

// Validation schemas
const createProductSchema = validate.Joi.object({
  name: validate.Joi.string().min(2).max(200).required(),
  description: validate.Joi.string().optional(),
  sku: validate.Joi.string().min(1).max(100).required(),
  price: validate.Joi.number().min(0).precision(2).required(),
  salePrice: validate.Joi.number().min(0).precision(2).optional(),
  stockQuantity: validate.Joi.number().integer().min(0).required(),
  categoryId: validate.Joi.number().integer().required(),
  brand: validate.Joi.string().max(100).optional(),
  featured: validate.Joi.boolean().optional()
});

const updateProductSchema = validate.Joi.object({
  name: validate.Joi.string().min(2).max(200).optional(),
  description: validate.Joi.string().optional(),
  price: validate.Joi.number().min(0).precision(2).optional(),
  salePrice: validate.Joi.number().min(0).precision(2).optional(),
  stockQuantity: validate.Joi.number().integer().min(0).optional(),
  categoryId: validate.Joi.number().integer().optional(),
  brand: validate.Joi.string().max(100).optional(),
  featured: validate.Joi.boolean().optional(),
  status: validate.Joi.string().valid('active', 'inactive', 'draft', 'out_of_stock').optional()
});

const searchProductsSchema = validate.Joi.object({
  q: validate.Joi.string().min(2).max(100).optional(),
  categoryId: validate.Joi.number().integer().optional(),
  brand: validate.Joi.string().max(50).optional(),
  minPrice: validate.Joi.number().min(0).optional(),
  maxPrice: validate.Joi.number().min(0).optional(),
  status: validate.Joi.string().valid('active', 'inactive', 'draft').optional(),
  featured: validate.Joi.boolean().optional(),
  inStock: validate.Joi.boolean().optional(),
  ...validate.pagination.describe().keys
});

/**
 * @route   GET /api/v1/products
 * @desc    Get all products with filtering
 * @access  Public
 */
router.get('/',
  validate(searchProductsSchema, 'query'),
  cache.apiCache(900), // 15 minutes cache
  productController.getProducts
);

/**
 * @route   GET /api/v1/products/search
 * @desc    Search products
 * @access  Public
 */
router.get('/search',
  validate(searchProductsSchema, 'query'),
  cache.apiCache(600), // 10 minutes cache
  productController.searchProducts
);

/**
 * @route   GET /api/v1/products/featured
 * @desc    Get featured products
 * @access  Public
 */
router.get('/featured',
  cache.apiCache(1800), // 30 minutes cache
  productController.getFeaturedProducts
);

/**
 * @route   GET /api/v1/products/:id
 * @desc    Get product by ID
 * @access  Public
 */
router.get('/:id',
  validate(validate.idParam, 'params'),
  cache.apiCache(1800), // 30 minutes cache
  productController.getProductById
);

/**
 * @route   POST /api/v1/products
 * @desc    Create new product (Admin only)
 * @access  Private/Admin
 */
router.post('/',
  authenticate,
  adminOnly,
  validate(createProductSchema),
  cache.invalidateCache(['products', 'api']),
  productController.createProduct
);

/**
 * @route   PUT /api/v1/products/:id
 * @desc    Update product (Admin only)
 * @access  Private/Admin
 */
router.put('/:id',
  authenticate,
  adminOnly,
  validate(validate.idParam, 'params'),
  validate(updateProductSchema),
  cache.invalidateCache(['products', 'api']),
  productController.updateProduct
);

/**
 * @route   DELETE /api/v1/products/:id
 * @desc    Delete product (Admin only)
 * @access  Private/Admin
 */
router.delete('/:id',
  authenticate,
  adminOnly,
  validate(validate.idParam, 'params'),
  cache.invalidateCache(['products', 'api']),
  productController.deleteProduct
);

module.exports = router;