const { ORDER_STATUS, PAYMENT_STATUS, PAYMENT_METHODS } = require('../config/constants');

module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    orderNumber: {
      type: DataTypes.STRING(50),
      field: 'order_number',
      allowNull: false,
      unique: true
    },
    userId: {
      type: DataTypes.INTEGER,
      field: 'user_id',
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM(...Object.values(ORDER_STATUS)),
      allowNull: false,
      defaultValue: ORDER_STATUS.PENDING
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'total_amount',
      allowNull: false,
      validate: {
        min: 0
      }
    },
    shippingAmount: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'shipping_amount',
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    taxAmount: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'tax_amount',
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'discount_amount',
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    shippingAddress: {
      type: DataTypes.JSON,
      field: 'shipping_address',
      allowNull: false
    },
    billingAddress: {
      type: DataTypes.JSON,
      field: 'billing_address',
      allowNull: true
    },
    paymentMethod: {
      type: DataTypes.ENUM(...Object.values(PAYMENT_METHODS)),
      field: 'payment_method',
      allowNull: false
    },
    paymentStatus: {
      type: DataTypes.ENUM(...Object.values(PAYMENT_STATUS)),
      field: 'payment_status',
      defaultValue: PAYMENT_STATUS.PENDING
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    shippedAt: {
      type: DataTypes.DATE,
      field: 'shipped_at',
      allowNull: true
    },
    deliveredAt: {
      type: DataTypes.DATE,
      field: 'delivered_at',
      allowNull: true
    }
  }, {
    tableName: 'orders',
    hooks: {
      beforeCreate: (order) => {
        if (!order.orderNumber) {
          order.orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
        }
      }
    }
  });

  // Instance methods
  Order.prototype.calculateSubtotal = async function() {
    const orderItems = await this.getOrderItems();
    return orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  Order.prototype.canBeCancelled = function() {
    return [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED].includes(this.status);
  };

  Order.prototype.cancel = async function() {
    if (!this.canBeCancelled()) {
      throw new Error('Order cannot be cancelled');
    }
    this.status = ORDER_STATUS.CANCELLED;
    await this.save();
    
    // Restore stock quantities
    const orderItems = await this.getOrderItems({ include: ['product'] });
    for (const item of orderItems) {
      if (item.product.manageStock) {
        await item.product.increaseStock(item.quantity);
      }
    }
  };

  // Model associations
  Order.associate = function(models) {
    Order.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });

    Order.hasMany(models.OrderItem, {
      foreignKey: 'orderId',
      as: 'orderItems'
    });
  };

  return Order;
};