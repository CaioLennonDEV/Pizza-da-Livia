const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  size: {
    type: String,
    enum: ['Pequena', 'Média', 'Grande', 'Família'],
    required: function() {
      return this.category === 'Pizza';
    }
  },
  price: {
    type: Number,
    required: true
  },
  observations: String
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  status: {
    type: String,
    enum: ['Pendente', 'Confirmado', 'Em Preparo', 'Saiu para Entrega', 'Entregue', 'Cancelado'],
    default: 'Pendente'
  },
  totalAmount: {
    type: Number,
    required: true
  },
  deliveryAddress: {
    street: {
      type: String,
      required: true
    },
    number: {
      type: String,
      required: true
    },
    complement: String,
    neighborhood: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    }
  },
  paymentMethod: {
    type: String,
    enum: ['Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'PIX'],
    required: true
  },
  changeNeeded: {
    type: Number,
    required: function() {
      return this.paymentMethod === 'Dinheiro';
    }
  },
  deliveryFee: {
    type: Number,
    required: true,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  estimatedDeliveryTime: {
    type: Date
  },
  deliveredAt: {
    type: Date
  }
});

// Middleware para calcular o tempo estimado de entrega
orderSchema.pre('save', function(next) {
  if (this.status === 'Confirmado' && !this.estimatedDeliveryTime) {
    // Adiciona 45 minutos ao tempo atual
    this.estimatedDeliveryTime = new Date(Date.now() + 45 * 60000);
  }
  if (this.status === 'Entregue' && !this.deliveredAt) {
    this.deliveredAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema); 