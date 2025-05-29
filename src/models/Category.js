const slug = require('slug');

module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: {
          args: [2, 100],
          msg: 'Category name must be between 2 and 100 characters'
        },
        notEmpty: {
          msg: 'Category name is required'
        }
      }
    },
    slug: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: {
        name: 'categories_slug_unique',
        msg: 'Category slug already exists'
      },
      validate: {
        len: {
          args: [2, 120],
          msg: 'Category slug must be between 2 and 120 characters'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    image: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: {
          msg: 'Image must be a valid URL'
        }
      }
    },
    parentId: {
      type: DataTypes.INTEGER,
      field: 'parent_id',
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id'
      }
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      field: 'sort_order',
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: 'Sort order must be a positive number'
        }
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      field: 'is_active',
      defaultValue: true
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    }
  }, {
    tableName: 'categories',
    indexes: [
      {
        unique: true,
        fields: ['slug']
      },
      {
        fields: ['parent_id']
      },
      {
        fields: ['is_active']
      },
      {
        fields: ['sort_order']
      },
      {
        fields: ['name']
      }
    ],
    hooks: {
      beforeValidate: (category) => {
        if (category.name && !category.slug) {
          category.slug = slug(category.name, { lower: true });
        }
      },
      beforeUpdate: (category) => {
        if (category.changed('name')) {
          category.slug = slug(category.name, { lower: true });
        }
      }
    },
    scopes: {
      active: {
        where: {
          isActive: true
        }
      },
      root: {
        where: {
          parentId: null
        }
      },
      withProducts: {
        include: [{
          association: 'products',
          required: false
        }]
      }
    }
  });

  // Instance methods
  Category.prototype.getFullPath = async function() {
    const path = [this.name];
    let currentCategory = this;
    
    while (currentCategory.parentId) {
      const parent = await Category.findByPk(currentCategory.parentId);
      if (parent) {
        path.unshift(parent.name);
        currentCategory = parent;
      } else {
        break;
      }
    }
    
    return path.join(' > ');
  };

  Category.prototype.isParentOf = function(categoryId) {
    return this.id === categoryId;
  };

  Category.prototype.isChildOf = function(categoryId) {
    return this.parentId === categoryId;
  };

  Category.prototype.hasChildren = async function() {
    const count = await Category.count({
      where: { parentId: this.id }
    });
    return count > 0;
  };

  Category.prototype.getChildren = function(options = {}) {
    return Category.findAll({
      where: { parentId: this.id },
      ...options
    });
  };

  Category.prototype.getParent = function() {
    if (!this.parentId) return null;
    return Category.findByPk(this.parentId);
  };

  Category.prototype.getAncestors = async function() {
    const ancestors = [];
    let currentCategory = this;
    
    while (currentCategory.parentId) {
      const parent = await Category.findByPk(currentCategory.parentId);
      if (parent) {
        ancestors.unshift(parent);
        currentCategory = parent;
      } else {
        break;
      }
    }
    
    return ancestors;
  };

  Category.prototype.getDescendants = async function() {
    const descendants = [];
    const children = await this.getChildren();
    
    for (const child of children) {
      descendants.push(child);
      const childDescendants = await child.getDescendants();
      descendants.push(...childDescendants);
    }
    
    return descendants;
  };

  // Class methods
  Category.findBySlug = function(slug) {
    return this.findOne({ where: { slug } });
  };

  Category.findActive = function(options = {}) {
    return this.scope('active').findAll(options);
  };

  Category.findRootCategories = function(options = {}) {
    return this.scope('root').findAll({
      order: [['sortOrder', 'ASC'], ['name', 'ASC']],
      ...options
    });
  };

  Category.buildTree = async function(parentId = null) {
    const categories = await this.findAll({
      where: { 
        parentId,
        isActive: true 
      },
      order: [['sortOrder', 'ASC'], ['name', 'ASC']]
    });

    const tree = [];
    for (const category of categories) {
      const categoryData = category.toJSON();
      categoryData.children = await this.buildTree(category.id);
      tree.push(categoryData);
    }

    return tree;
  };

  Category.getStats = async function() {
    const totalCategories = await this.count();
    const activeCategories = await this.count({ 
      where: { isActive: true } 
    });
    const rootCategories = await this.count({ 
      where: { parentId: null } 
    });
    
    return {
      total: totalCategories,
      active: activeCategories,
      root: rootCategories,
      nested: totalCategories - rootCategories
    };
  };

  // Model associations
  Category.associate = function(models) {
    // Category has many Products
    Category.hasMany(models.Product, {
      foreignKey: 'categoryId',
      as: 'products'
    });

    // Self-referencing association for parent-child relationship
    Category.hasMany(Category, {
      foreignKey: 'parentId',
      as: 'children'
    });

    Category.belongsTo(Category, {
      foreignKey: 'parentId',
      as: 'parent'
    });
  };

  return Category;
};