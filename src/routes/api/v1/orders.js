const express = require('express');
const router = express.Router();
const { authenticate, adminOnly, validate } = require('../../../middlewares');

// Mock order controller
const orderController = {
  getOrders: (req, res) => {
    res.json({
      success: true,
      message: 'Orders retrieved successfully',
      data: [
        { 
          id: 1, 
          orderNumber: 'ORD-001',
          userId: 1,
          status: 'pending',
          totalAmount: 1299.00,
          shippingAmount: 10.00,
          createdAt: new Date().toISOString()
        },
        { 
          id: 2, 
          orderNumber: 'ORD-002',
          userId: 1,
          status: 'confirmed',
          totalAmount: 799.00,
          shippingAmount: 15.00,
          createdAt: new Date().toISOString()
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
  
  getOrderById: (req, res) => {
    res.json({
      success: true,
      message: 'Order retrieved successfully',
      data: { 
        id: parseInt(req.params.id), 
        orderNumber: 'ORD-001',
        userId: 1,
        status: 'pending',
        totalAmount: 1299.00,
        shippingAmount: 10.00,
        taxAmount: 104.00,
        shippingAddress: {
          street: '123 Main St',
          city: 'Ho Chi Minh City',
          country: 'Vietnam',
          zipCode: '70000'
        },
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        orderItems: [
          {
            id: 1,
            productId: 1,
            productName: 'iPhone 15',
            quantity: 1,
            price: 899.00,
            total: 899.00
          },
          {
            id: 2,
            productId: 2,
            productName: 'iPhone Case',
            quantity: 2,
            price: 25.00,
            total: 50.00
          }
        ],
        createdAt: new Date().toISOString()
      }
    });
  },
  
  createOrder: (req, res) => {
    res.json({
      success: true,
      message: 'Order created successfully',
      data: { 
        id: Date.now(), 
        orderNumber: `ORD-${Date.now()}`,
        ...req.body,
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: new Date().toISOString()
      }
    });
  },
  
  updateOrderStatus: (req, res) => {
    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { 
        id: parseInt(req.params.id), 
        status: req.body.status,
        updatedAt: new Date().toISOString()
      }
    });
  },
  
  cancelOrder: (req, res) => {
    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: { 
        id: parseInt(req.params.id), 
        status: 'cancelled',
        cancelledAt: new Date().toISOString()
      }
    });
  }
};

// Validation schemas
const createOrderSchema = validate.Joi.object({
  orderItems: validate.Joi.array().items(
    validate.Joi.object({
      productId: validate.Joi.number().integer().required(),
      quantity: validate.Joi.number().integer().min(1).required(),
      price: validate.Joi.number().min(0).precision(2).required()
    })
  ).min(1).required(),
  shippingAddress: validate.Joi.object({
    street: validate.Joi.string().required(),
    city: validate.Joi.string().required(),
    country: validate.Joi.string().required(),
    zipCode: validate.Joi.string().required(),
    phone: validate.phone.optional()
  }).required(),
  billingAddress: validate.Joi.object({
    street: validate.Joi.string().required(),
    city: validate.Joi.string().required(),
    country: validate.Joi.string().required(),
    zipCode: validate.Joi.string().required()
  }).optional(),
  paymentMethod: validate.Joi.string().valid('cod', 'credit_card', 'paypal', 'bank_transfer').required(),
  notes: validate.Joi.string().max(500).optional()
});

const updateOrderStatusSchema = validate.Joi.object({
  status: validate.Joi.string().valid(
    'pending', 
    'confirmed', 
    'processing', 
    'shipped', 
    'delivered', 
    'cancelled', 
    'refunded'
  ).required(),
  notes: validate.Joi.string().max(500).optional()
});

const orderQuerySchema = validate.Joi.object({
  status: validate.Joi.string().valid(
    'pending', 
    'confirmed', 
    'processing', 
    'shipped', 
    'delivered', 
    'cancelled', 
    'refunded'
  ).optional(),
  paymentStatus: validate.Joi.string().valid('pending', 'completed', 'failed', 'refunded').optional(),
  paymentMethod: validate.Joi.string().valid('cod', 'credit_card', 'paypal', 'bank_transfer').optional(),
  startDate: validate.Joi.date().optional(),
  endDate: validate.Joi.date().optional(),
  ...validate.pagination.describe().keys
});

/**
 * @route   GET /api/v1/orders
 * @desc    Get user orders or all orders (admin)
 * @access  Private
 */
router.get('/',
  authenticate,
  validate(orderQuerySchema, 'query'),
  orderController.getOrders
);

/**
 * @route   GET /api/v1/orders/:id
 * @desc    Get order by ID
 * @access  Private
 */
router.get('/:id',
  authenticate,
  validate(validate.idParam, 'params'),
  orderController.getOrderById
);

/**
 * @route   POST /api/v1/orders
 * @desc    Create new order
 * @access  Private
 */
router.post('/',
  authenticate,
  validate(createOrderSchema),
  orderController.createOrder
);

/**
 * @route   PUT /api/v1/orders/:id/status
 * @desc    Update order status (Admin only)
 * @access  Private/Admin
 */
router.put('/:id/status',
  authenticate,
  adminOnly,
  validate(validate.idParam, 'params'),
  validate(updateOrderStatusSchema),
  orderController.updateOrderStatus
);

/**
 * @route   DELETE /api/v1/orders/:id
 * @desc    Cancel order
 * @access  Private
 */
router.delete('/:id',
  authenticate,
  validate(validate.idParam, 'params'),
  orderController.cancelOrder
);

module.exports = router;