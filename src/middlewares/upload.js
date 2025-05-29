const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { ApiResponse } = require('../utils/response');
const { logger } = require('../utils/logger');
const { UPLOAD } = require('../config/constants');

/**
 * Ensure upload directory exists
 */
const ensureUploadDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

/**
 * Generate unique filename
 */
const generateFileName = (originalname) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = path.extname(originalname).toLowerCase();
  return `${timestamp}-${randomString}${extension}`;
};

/**
 * Multer Storage Configuration
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'storage/uploads';
    
    // Create different folders based on file type
    if (file.mimetype.startsWith('image/')) {
      uploadPath = path.join(uploadPath, 'images');
    } else if (file.mimetype.startsWith('video/')) {
      uploadPath = path.join(uploadPath, 'videos');
    } else if (file.mimetype === 'application/pdf') {
      uploadPath = path.join(uploadPath, 'documents');
    } else {
      uploadPath = path.join(uploadPath, 'others');
    }
    
    // Create date-based subdirectories
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    uploadPath = path.join(uploadPath, String(year), month);
    
    ensureUploadDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const filename = generateFileName(file.originalname);
    cb(null, filename);
  }
});

/**
 * Memory Storage for processing before saving
 */
const memoryStorage = multer.memoryStorage();

/**
 * File Filter Function
 */
const fileFilter = (allowedTypes = UPLOAD.ALLOWED_IMAGE_TYPES) => {
  return (req, file, cb) => {
    // Check file type
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const error = new Error(`File type ${file.mimetype} is not allowed`);
      error.code = 'INVALID_FILE_TYPE';
      cb(error, false);
    }
  };
};

/**
 * Basic Upload Middleware
 */
const upload = multer({
  storage: storage,
  limits: {
    fileSize: UPLOAD.MAX_FILE_SIZE,
    files: 10, // Maximum 10 files
    fields: 20, // Maximum 20 non-file fields
    parts: 30 // Maximum 30 parts
  },
  fileFilter: fileFilter()
});

/**
 * Image Upload Middleware
 */
const imageUpload = multer({
  storage: storage,
  limits: {
    fileSize: UPLOAD.MAX_FILE_SIZE,
    files: 5
  },
  fileFilter: fileFilter(UPLOAD.ALLOWED_IMAGE_TYPES)
});

/**
 * Document Upload Middleware
 */
const documentUpload = multer({
  storage: storage,
  limits: {
    fileSize: UPLOAD.MAX_FILE_SIZE * 2, // 10MB for documents
    files: 3
  },
  fileFilter: fileFilter(UPLOAD.ALLOWED_DOCUMENT_TYPES)
});

/**
 * Avatar Upload Middleware (single image, smaller size)
 */
const avatarUpload = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB for avatars
    files: 1
  },
  fileFilter: fileFilter(['image/jpeg', 'image/png', 'image/webp'])
});

/**
 * Product Images Upload Middleware
 */
const productImagesUpload = multer({
  storage: storage,
  limits: {
    fileSize: UPLOAD.MAX_FILE_SIZE,
    files: 8 // Maximum 8 product images
  },
  fileFilter: fileFilter(UPLOAD.ALLOWED_IMAGE_TYPES)
});

/**
 * Image Processing Middleware
 */
const processImage = (sizes = UPLOAD.IMAGE_SIZES) => {
  return async (req, res, next) => {
    if (!req.file && !req.files) {
      return next();
    }

    try {
      const files = req.files || [req.file];
      const processedFiles = [];

      for (const file of files) {
        if (file.mimetype.startsWith('image/')) {
          const processedSizes = {};
          
          // Process different sizes
          for (const [sizeName, dimensions] of Object.entries(sizes)) {
            const outputDir = path.join('storage/uploads/images/processed', sizeName);
            ensureUploadDir(outputDir);
            
            const filename = generateFileName(file.originalname);
            const outputPath = path.join(outputDir, filename);
            
            await sharp(file.buffer || file.path)
              .resize(dimensions.width, dimensions.height, {
                fit: 'cover',
                position: 'center'
              })
              .jpeg({ quality: 80 })
              .toFile(outputPath);
            
            processedSizes[sizeName] = {
              path: outputPath,
              url: `/uploads/images/processed/${sizeName}/${filename}`,
              width: dimensions.width,
              height: dimensions.height
            };
          }
          
          processedFiles.push({
            ...file,
            processed: processedSizes
          });
        } else {
          processedFiles.push(file);
        }
      }

      // Update request with processed files
      if (req.files) {
        req.files = processedFiles;
      } else {
        req.file = processedFiles[0];
      }

      next();
    } catch (error) {
      logger.error('Image processing error:', error);
      return res.status(500).json(
        ApiResponse.internalError('Image processing failed')
      );
    }
  };
};

/**
 * File Upload Error Handler
 */
const uploadErrorHandler = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    let message = 'File upload error';
    let statusCode = 400;

    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        message = `File too large. Maximum size allowed is ${UPLOAD.MAX_FILE_SIZE / (1024 * 1024)}MB`;
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files uploaded';
        break;
      case 'LIMIT_FIELD_COUNT':
        message = 'Too many form fields';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected field name for file upload';
        break;
      case 'MISSING_FILE':
        message = 'File is required';
        break;
      default:
        message = error.message || 'File upload error';
    }

    logger.warn('Upload Error:', {
      code: error.code,
      message: message,
      field: error.field,
      url: req.originalUrl,
      userId: req.user ? req.user.id : null
    });

    return res.status(statusCode).json(ApiResponse.badRequest(message));
  }

  if (error.code === 'INVALID_FILE_TYPE') {
    return res.status(400).json(
      ApiResponse.badRequest(error.message)
    );
  }

  next(error);
};

/**
 * File Validation Middleware
 */
const validateFile = (options = {}) => {
  const {
    required = false,
    maxSize = UPLOAD.MAX_FILE_SIZE,
    allowedTypes = UPLOAD.ALLOWED_IMAGE_TYPES,
    maxFiles = 1
  } = options;

  return (req, res, next) => {
    const files = req.files || (req.file ? [req.file] : []);

    // Check if file is required
    if (required && files.length === 0) {
      return res.status(400).json(
        ApiResponse.badRequest('File is required')
      );
    }

    // Check file count
    if (files.length > maxFiles) {
      return res.status(400).json(
        ApiResponse.badRequest(`Maximum ${maxFiles} files allowed`)
      );
    }

    // Validate each file
    for (const file of files) {
      // Check file size
      if (file.size > maxSize) {
        return res.status(400).json(
          ApiResponse.badRequest(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`)
        );
      }

      // Check file type
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json(
          ApiResponse.badRequest(`File type ${file.mimetype} is not allowed`)
        );
      }

      // Check for malicious file patterns
      if (file.originalname && /\.(php|exe|bat|cmd|scr|pif|jar)$/i.test(file.originalname)) {
        logger.logSecurity.suspiciousActivity(
          req.ip,
          req.get('User-Agent'),
          `Attempted to upload suspicious file: ${file.originalname}`
        );
        
        return res.status(400).json(
          ApiResponse.badRequest('File type not allowed for security reasons')
        );
      }
    }

    next();
  };
};

/**
 * Clean up uploaded files on error
 */
const cleanupFiles = (files) => {
  if (!files) return;
  
  const fileList = Array.isArray(files) ? files : [files];
  
  fileList.forEach(file => {
    if (file.path && fs.existsSync(file.path)) {
      fs.unlink(file.path, (err) => {
        if (err) {
          logger.error('Error cleaning up file:', err);
        }
      });
    }
  });
};

/**
 * File cleanup middleware for errors
 */
const fileCleanupOnError = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // If response is an error and files were uploaded, clean them up
    if (res.statusCode >= 400 && (req.file || req.files)) {
      cleanupFiles(req.files || req.file);
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

module.exports = {
  // Basic upload middleware
  upload,
  imageUpload,
  documentUpload,
  avatarUpload,
  productImagesUpload,
  
  // Processing middleware
  processImage,
  
  // Validation and error handling
  validateFile,
  uploadErrorHandler,
  fileCleanupOnError,
  
  // Utility functions
  ensureUploadDir,
  generateFileName,
  cleanupFiles,
  
  // Storage configurations
  storage,
  memoryStorage,
  fileFilter
};