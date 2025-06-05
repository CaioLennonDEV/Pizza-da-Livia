const mongoose = require('mongoose');

const sizeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['Pequena', 'Média', 'Grande', 'Família']
  },
  price: {
    type: Number,
    required: true
  }
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome do produto é obrigatório'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Descrição do produto é obrigatória']
  },
  category: {
    type: String,
    required: true,
    enum: ['Pizza', 'Bebida', 'Acompanhamento']
  },
  ingredients: [{
    type: String,
    required: function() {
      return this.category === 'Pizza';
    }
  }],
  image: {
    type: String,
    required: [true, 'Imagem do produto é obrigatória']
  },
  sizes: {
    type: [sizeSchema],
    required: function() {
      return this.category === 'Pizza';
    }
  },
  price: {
    type: Number,
    required: function() {
      return this.category !== 'Pizza';
    }
  },
  available: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', productSchema); 