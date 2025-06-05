const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    minlength: 6,
    select: false
  },
  phone: {
    type: String,
    required: [true, 'Telefone é obrigatório']
  },
  address: {
    street: {
      type: String,
      required: [true, 'Rua é obrigatória']
    },
    number: {
      type: String,
      required: [true, 'Número é obrigatório']
    },
    complement: String,
    neighborhood: {
      type: String,
      required: [true, 'Bairro é obrigatório']
    },
    city: {
      type: String,
      required: [true, 'Cidade é obrigatória']
    },
    state: {
      type: String,
      required: [true, 'Estado é obrigatório']
    },
    zipCode: {
      type: String,
      required: [true, 'CEP é obrigatório']
    }
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to check if password matches
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema); 