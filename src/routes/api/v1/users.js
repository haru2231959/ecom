const express = require('express');
const router = express.Router();
const { authenticate, adminOnly, validate } = require('../../../middlewares');

// Mock user controller
const userController = {
  getUsers: (req, res) => {
    res.json({
      success: true,
      message: 'Users retrieved successfully',
      data: [
        { id: 1, email: 'user1@example.com', firstName: 'John', lastName: 'Doe' },
        { id: 2, email: 'user2@example.com', firstName: 'Jane', lastName: 'Smith' }
      ],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 2,
        itemsPerPage: 20
      }
    });
  },
  
  getUserById: (req, res) => {
    res.json({
      success: true,
      message: 'User retrieved successfully',
      data: { 
        id: parseInt(req.params.id), 
        email: 'user@example.com', 
        firstName: 'John', 
        lastName: 'Doe' 
      }
    });
  },
  
  updateUser: (req, res) => {
    res.json({
      success: true,
      message: 'User updated successfully',
      data: { 
        id: parseInt(req.params.id), 
        ...req.body 
      }
    });
  },
  
  deleteUser: (req, res) => {
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  },
  
  getProfile: (req, res) => {
    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: { 
        id: 1, 
        email: 'user@example.com', 
        firstName: 'John', 
        lastName: 'Doe' 
      }
    });
  },
  
  updateProfile: (req, res) => {
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { 
        id: 1, 
        ...req.body 
      }
    });
  }
};

// Validation schemas
const updateUserSchema = validate.Joi.object({
  firstName: validate.Joi.string().min(2).max(50).optional(),
  lastName: validate.Joi.string().min(2).max(50).optional(),
  phone: validate.phone.optional(),
  address: validate.Joi.string().max(255).optional(),
  city: validate.Joi.string().max(100).optional(),
  country: validate.Joi.string().max(100).optional()
});

/**
 * @route   GET /api/v1/users
 * @desc    Get all users (Admin only)
 * @access  Private/Admin
 */
router.get('/',
  authenticate,
  adminOnly,
  validate(validate.pagination, 'query'),
  userController.getUsers
);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID
 * @access  Private
 */
router.get('/:id',
  authenticate,
  validate(validate.idParam, 'params'),
  userController.getUserById
);

/**
 * @route   PUT /api/v1/users/:id
 * @desc    Update user (Admin only)
 * @access  Private/Admin
 */
router.put('/:id',
  authenticate,
  adminOnly,
  validate(validate.idParam, 'params'),
  validate(updateUserSchema),
  userController.updateUser
);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Delete user (Admin only)
 * @access  Private/Admin
 */
router.delete('/:id',
  authenticate,
  adminOnly,
  validate(validate.idParam, 'params'),
  userController.deleteUser
);

/**
 * @route   GET /api/v1/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile',
  authenticate,
  userController.getProfile
);

/**
 * @route   PUT /api/v1/users/profile
 * @desc    Update current user profile
 * @access  Private
 */
router.put('/profile',
  authenticate,
  validate(updateUserSchema),
  userController.updateProfile
);

module.exports = router;