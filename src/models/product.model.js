const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Nome do produto é obrigatório' }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Descrição do produto é obrigatória' }
    }
  },
  category: {
    type: DataTypes.ENUM('Pizza', 'Bebida', 'Acompanhamento'),
    allowNull: false
  },
  ingredients: {
    type: DataTypes.TEXT,
    get() {
      const rawValue = this.getDataValue('ingredients');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('ingredients', JSON.stringify(value));
    }
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sizes: {
    type: DataTypes.TEXT,
    get() {
      const rawValue = this.getDataValue('sizes');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('sizes', JSON.stringify(value));
    }
  },
  price: {
    type: DataTypes.FLOAT,
    validate: {
      isNumeric: { msg: 'Preço deve ser um número' }
    }
  },
  available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

module.exports = Product; 