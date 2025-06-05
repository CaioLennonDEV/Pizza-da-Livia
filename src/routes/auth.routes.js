const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { protect } = require('../middlewares/auth.middleware');

// Validação de registro
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Nome é obrigatório'),
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .custom(async (value) => {
      const user = await User.findOne({ email: value });
      if (user) {
        throw new Error('Email já cadastrado');
      }
      return true;
    }),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter no mínimo 6 caracteres'),
  body('phone').notEmpty().withMessage('Telefone é obrigatório'),
  body('address.street').notEmpty().withMessage('Rua é obrigatória'),
  body('address.number').notEmpty().withMessage('Número é obrigatório'),
  body('address.neighborhood').notEmpty().withMessage('Bairro é obrigatório'),
  body('address.city').notEmpty().withMessage('Cidade é obrigatória'),
  body('address.state').notEmpty().withMessage('Estado é obrigatório'),
  body('address.zipCode').notEmpty().withMessage('CEP é obrigatório')
];

// Registro de usuário
router.post('/register', registerValidation, async (req, res) => {
  try {
    const user = await User.create(req.body);
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    res.status(400).json({
      message: 'Erro ao criar usuário',
      error: error.message
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Por favor, forneça email e senha'
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        message: 'Email ou senha inválidos'
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    res.status(500).json({
      message: 'Erro ao fazer login',
      error: error.message
    });
  }
});

// Obter usuário atual
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Erro ao obter dados do usuário',
      error: error.message
    });
  }
});

module.exports = router; 