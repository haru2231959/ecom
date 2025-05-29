const slug = require('slug');
const { PRODUCT_STATUS } = require('../config/constants');

module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        len: {
          args: [2, 200],
          msg: 'Product name must be between 2 and 200 characters'
        },
        notEmpty: {
          msg: 'Product name is required'
        }
      }
    },
    slug: {
      type: DataTypes.STRING(220),
      allowNull: false,
      unique: {
        name: 'products_slug_unique',
        msg: 'Product slug already exists'
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    shortDescription: {
      type: DataTypes.TEXT,
      field: 'short_description',
      allowNull: true,
      validate: {
        len: {
          args: [0, 500],
          msg: 'Short description must not exceed 500 characters'
        }
      }
    },
    sku: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: {
        name: 'products_sku_unique',
        msg: 'SKU already exists'
      },
      validate: {
        len: {
          args: [1, 100],
          msg: 'SKU must be between 1 and 100 characters'
        },
        notEmpty: {
          msg: 'SKU is required'
        }
      }
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: 'Price must be a positive number'
        },
        isDecimal: {
          msg: 'Price must be a valid decimal number'
        }
      }
    },
    salePrice: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'sale_price',
      allowNull: true,
      validate: {
        min: {
          args: [0],
          msg: 'Sale price must be a positive number'
        },
        isDecimal: {
          msg: 'Sale price must be a valid decimal number'
        }
      }
    },
    stockQuantity: {
      type: DataTypes.INTEGER,
      field: 'stock_quantity',
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: 'Stock quantity must be a positive number'
        }
      }
    },
    categoryId: {
      type: DataTypes.INTEGER,
      field: 'category_id',
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id'
      }
    },
    brand: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    status: {
      type: DataTypes.ENUM(...Object.values(PRODUCT_STATUS)),
      allowNull: false,
      defaultValue: PRODUCT_STATUS.ACTIVE
    },
    featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    viewCount: {
      type: DataTypes.INTEGER,
      field: 'view_count',
      defaultValue: 0
    },
    soldCount: {
      type: DataTypes.INTEGER,
      field: 'sold_count',
      defaultValue: 0
    }
  }, {
    tableName: 'products',
    hooks: {
      beforeValidate: (product) => {
        if (product.name && !product.slug) {
          product.slug = slug(product.name, { lower: true });
        }
      }
    }
  });

  // Instance methods
  Product.prototype.getCurrentPrice = function() {
    return this.salePrice && this.salePrice > 0 ? this.salePrice : this.price;
  };

  Product.prototype.isInStock = function() {
    return this.stockQuantity > 0;
  };

  // Class methods
  Product.findBySlug = function(slug) {
    return this.findOne({ where: { slug } });
  };

  // Model associations
  Product.associate = function(models) {
    Product.belongsTo(models.Category, {
      foreignKey: 'categoryId',
      as: 'category'
    });

    Product.hasMany(models.OrderItem, {
      foreignKey: 'productId',
      as: 'orderItems'
    });
  };

  return Product;
};