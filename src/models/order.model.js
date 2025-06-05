const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Orders',
      key: 'id'
    }
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Products',
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  size: {
    type: DataTypes.ENUM('Pequena', 'Média', 'Grande', 'Família')
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  observations: {
    type: DataTypes.TEXT
  }
});

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('Pendente', 'Confirmado', 'Em Preparo', 'Saiu para Entrega', 'Entregue', 'Cancelado'),
    defaultValue: 'Pendente'
  },
  totalAmount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  street: {
    type: DataTypes.STRING,
    allowNull: false
  },
  number: {
    type: DataTypes.STRING,
    allowNull: false
  },
  complement: {
    type: DataTypes.STRING
  },
  neighborhood: {
    type: DataTypes.STRING,
    allowNull: false
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false
  },
  state: {
    type: DataTypes.STRING,
    allowNull: false
  },
  zipCode: {
    type: DataTypes.STRING,
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.ENUM('Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'PIX'),
    allowNull: false
  },
  changeNeeded: {
    type: DataTypes.FLOAT
  },
  deliveryFee: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  estimatedDeliveryTime: {
    type: DataTypes.DATE
  },
  deliveredAt: {
    type: DataTypes.DATE
  }
}, {
  hooks: {
    beforeCreate: (order) => {
      if (order.status === 'Confirmado' && !order.estimatedDeliveryTime) {
        order.estimatedDeliveryTime = new Date(Date.now() + 45 * 60000);
      }
      if (order.status === 'Entregue' && !order.deliveredAt) {
        order.deliveredAt = new Date();
      }
    }
  }
});

// Definindo os relacionamentos
Order.hasMany(OrderItem, { as: 'items', foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

module.exports = { Order, OrderItem }; 