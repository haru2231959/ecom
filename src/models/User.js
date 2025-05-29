const bcrypt = require('bcryptjs');
const { USER_ROLES, USER_STATUS } = require('../config/constants');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: {
        name: 'users_email_unique',
        msg: 'Email address already exists'
      },
      validate: {
        isEmail: {
          msg: 'Must be a valid email address'
        },
        len: {
          args: [5, 100],
          msg: 'Email must be between 5 and 100 characters'
        }
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: {
          args: [6, 255],
          msg: 'Password must be at least 6 characters long'
        }
      }
    },
    firstName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'first_name',
      validate: {
        len: {
          args: [1, 50],
          msg: 'First name must be between 1 and 50 characters'
        },
        notEmpty: {
          msg: 'First name is required'
        }
      }
    },
    lastName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'last_name',
      validate: {
        len: {
          args: [1, 50],
          msg: 'Last name must be between 1 and 50 characters'
        },
        notEmpty: {
          msg: 'Last name is required'
        }
      }
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        len: {
          args: [10, 20],
          msg: 'Phone number must be between 10 and 20 characters'
        }
      }
    },
    avatar: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      field: 'date_of_birth',
      allowNull: true,
      validate: {
        isDate: {
          msg: 'Date of birth must be a valid date'
        },
        isBefore: {
          args: new Date().toISOString().split('T')[0],
          msg: 'Date of birth must be in the past'
        }
      }
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other'),
      allowNull: true
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: 'Vietnam'
    },
    zipCode: {
      type: DataTypes.STRING(20),
      field: 'zip_code',
      allowNull: true
    },
    role: {
      type: DataTypes.ENUM(...Object.values(USER_ROLES)),
      allowNull: false,
      defaultValue: USER_ROLES.USER,
      validate: {
        isIn: {
          args: [Object.values(USER_ROLES)],
          msg: 'Invalid user role'
        }
      }
    },
    status: {
      type: DataTypes.ENUM(...Object.values(USER_STATUS)),
      allowNull: false,
      defaultValue: USER_STATUS.ACTIVE,
      validate: {
        isIn: {
          args: [Object.values(USER_STATUS)],
          msg: 'Invalid user status'
        }
      }
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      field: 'is_email_verified',
      defaultValue: false
    },
    emailVerifiedAt: {
      type: DataTypes.DATE,
      field: 'email_verified_at',
      allowNull: true
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      field: 'last_login_at',
      allowNull: true
    },
    loginCount: {
      type: DataTypes.INTEGER,
      field: 'login_count',
      defaultValue: 0
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      field: 'reset_password_token',
      allowNull: true
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
      field: 'reset_password_expires',
      allowNull: true
    },
    emailVerificationToken: {
      type: DataTypes.STRING,
      field: 'email_verification_token',
      allowNull: true
    },
    twoFactorEnabled: {
      type: DataTypes.BOOLEAN,
      field: 'two_factor_enabled',
      defaultValue: false
    },
    twoFactorSecret: {
      type: DataTypes.STRING,
      field: 'two_factor_secret',
      allowNull: true
    },
    preferences: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    }
  }, {
    tableName: 'users',
    indexes: [
      {
        unique: true,
        fields: ['email']
      },
      {
        fields: ['role']
      },
      {
        fields: ['status']
      },
      {
        fields: ['is_email_verified']
      },
      {
        fields: ['created_at']
      },
      {
        fields: ['reset_password_token']
      },
      {
        fields: ['email_verification_token']
      }
    ],
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 12);
        }
        // Generate email verification token
        if (!user.emailVerificationToken && !user.isEmailVerified) {
          user.emailVerificationToken = require('crypto').randomBytes(32).toString('hex');
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
      beforeBulkCreate: (users) => {
        return Promise.all(users.map(async (user) => {
          if (user.password) {
            user.password = await bcrypt.hash(user.password, 12);
          }
          return user;
        }));
      }
    },
    scopes: {
      active: {
        where: {
          status: USER_STATUS.ACTIVE
        }
      },
      verified: {
        where: {
          isEmailVerified: true
        }
      },
      admin: {
        where: {
          role: USER_ROLES.ADMIN
        }
      },
      withoutPassword: {
        attributes: {
          exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires', 'emailVerificationToken', 'twoFactorSecret']
        }
      }
    }
  });

  // Instance methods
  User.prototype.validatePassword = async function(password) {
    return bcrypt.compare(password, this.password);
  };

  User.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.password;
    delete values.resetPasswordToken;
    delete values.resetPasswordExpires;
    delete values.emailVerificationToken;
    delete values.twoFactorSecret;
    return values;
  };

  User.prototype.getFullName = function() {
    return `${this.firstName} ${this.lastName}`;
  };

  User.prototype.isAdmin = function() {
    return this.role === USER_ROLES.ADMIN;
  };

  User.prototype.isModerator = function() {
    return this.role === USER_ROLES.MODERATOR;
  };

  User.prototype.isActive = function() {
    return this.status === USER_STATUS.ACTIVE;
  };

  User.prototype.canAccess = function(resource) {
    // Define role-based access control logic
    const permissions = {
      [USER_ROLES.ADMIN]: ['*'],
      [USER_ROLES.MODERATOR]: ['users.read', 'products.*', 'orders.read'],
      [USER_ROLES.USER]: ['profile.*', 'orders.own']
    };

    const userPermissions = permissions[this.role] || [];
    
    if (userPermissions.includes('*')) {
      return true;
    }

    return userPermissions.some(permission => {
      if (permission.endsWith('.*')) {
        return resource.startsWith(permission.slice(0, -2));
      }
      return permission === resource;
    });
  };

  User.prototype.updateLastLogin = async function() {
    this.lastLoginAt = new Date();
    this.loginCount += 1;
    await this.save({ silent: true });
  };

  User.prototype.generatePasswordResetToken = function() {
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    this.resetPasswordToken = token;
    this.resetPasswordExpires = expires;
    
    return token;
  };

  User.prototype.clearPasswordResetToken = function() {
    this.resetPasswordToken = null;
    this.resetPasswordExpires = null;
  };

  User.prototype.verifyEmail = function() {
    this.isEmailVerified = true;
    this.emailVerifiedAt = new Date();
    this.emailVerificationToken = null;
  };

  // Class methods
  User.findByEmail = function(email) {
    return this.findOne({ 
      where: { email: email.toLowerCase() }
    });
  };

  User.findActiveUsers = function(options = {}) {
    return this.scope('active').findAll(options);
  };

  User.findVerifiedUsers = function(options = {}) {
    return this.scope('verified').findAll(options);
  };

  User.findAdmins = function(options = {}) {
    return this.scope('admin').findAll(options);
  };

  User.findByResetToken = function(token) {
    return this.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          [sequelize.Sequelize.Op.gt]: new Date()
        }
      }
    });
  };

  User.findByVerificationToken = function(token) {
    return this.findOne({
      where: {
        emailVerificationToken: token
      }
    });
  };

  // Model associations
  User.associate = function(models) {
    // User has many Orders
    User.hasMany(models.Order, {
      foreignKey: 'userId',
      as: 'orders'
    });

    // User has many RefreshTokens
    User.hasMany(models.RefreshToken, {
      foreignKey: 'userId',
      as: 'refreshTokens'
    });
  };

  return User;
};