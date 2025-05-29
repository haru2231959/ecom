module.exports = (sequelize, DataTypes) => {
  const RefreshToken = sequelize.define('RefreshToken', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    token: {
      type: DataTypes.STRING(500),
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
    expiresAt: {
      type: DataTypes.DATE,
      field: 'expires_at',
      allowNull: false
    },
    isRevoked: {
      type: DataTypes.BOOLEAN,
      field: 'is_revoked',
      defaultValue: false
    },
    userAgent: {
      type: DataTypes.TEXT,
      field: 'user_agent',
      allowNull: true
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      field: 'ip_address',
      allowNull: true
    }
  }, {
    tableName: 'refresh_tokens',
    indexes: [
      {
        unique: true,
        fields: ['token']
      },
      {
        fields: ['user_id']
      },
      {
        fields: ['expires_at']
      },
      {
        fields: ['is_revoked']
      }
    ]
  });

  // Instance methods
  RefreshToken.prototype.isExpired = function() {
    return new Date() > this.expiresAt;
  };

  RefreshToken.prototype.isValid = function() {
    return !this.isRevoked && !this.isExpired();
  };

  RefreshToken.prototype.revoke = async function() {
    this.isRevoked = true;
    await this.save();
  };

  // Class methods
  RefreshToken.createToken = async function(userId, token, expiresAt, userAgent = null, ipAddress = null) {
    return this.create({
      token,
      userId,
      expiresAt,
      userAgent,
      ipAddress
    });
  };

  RefreshToken.findValidToken = function(token) {
    return this.findOne({
      where: {
        token,
        isRevoked: false,
        expiresAt: {
          [sequelize.Sequelize.Op.gt]: new Date()
        }
      }
    });
  };

  RefreshToken.revokeAllUserTokens = async function(userId) {
    await this.update(
      { isRevoked: true },
      { where: { userId, isRevoked: false } }
    );
  };

  RefreshToken.cleanupExpiredTokens = async function() {
    const result = await this.destroy({
      where: {
        expiresAt: {
          [sequelize.Sequelize.Op.lt]: new Date()
        }
      }
    });
    return result;
  };

  // Model associations
  RefreshToken.associate = function(models) {
    RefreshToken.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return RefreshToken;
};