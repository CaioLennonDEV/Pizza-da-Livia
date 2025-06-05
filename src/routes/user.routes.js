const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { body } = require('express-validator');

// Atualizar perfil do usuário
router.put('/profile', protect, [
  body('name').optional().trim().notEmpty().withMessage('Nome é obrigatório'),
  body('phone').optional().notEmpty().withMessage('Telefone é obrigatório'),
  body('address.street').optional().notEmpty().withMessage('Rua é obrigatória'),
  body('address.number').optional().notEmpty().withMessage('Número é obrigatório'),
  body('address.neighborhood').optional().notEmpty().withMessage('Bairro é obrigatório'),
  body('address.city').optional().notEmpty().withMessage('Cidade é obrigatória'),
  body('address.state').optional().notEmpty().withMessage('Estado é obrigatório'),
  body('address.zipCode').optional().notEmpty().withMessage('CEP é obrigatório')
], async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          name: req.body.name,
          phone: req.body.phone,
          address: req.body.address
        }
      },
      { new: true, runValidators: true }
    );

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
    res.status(400).json({
      message: 'Erro ao atualizar perfil',
      error: error.message
    });
  }
});

// Alterar senha
router.put('/change-password', protect, [
  body('currentPassword').notEmpty().withMessage('Senha atual é obrigatória'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Nova senha deve ter no mínimo 6 caracteres')
], async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res.status(401).json({
        message: 'Senha atual incorreta'
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    res.json({
      message: 'Senha alterada com sucesso'
    });
  } catch (error) {
    res.status(400).json({
      message: 'Erro ao alterar senha',
      error: error.message
    });
  }
});

// Listar todos os usuários (apenas admin)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: 'Erro ao listar usuários',
      error: error.message
    });
  }
});

// Obter usuário por ID (apenas admin)
router.get('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        message: 'Usuário não encontrado'
      });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: 'Erro ao obter usuário',
      error: error.message
    });
  }
});

// Atualizar papel do usuário (apenas admin)
router.patch('/:id/role', protect, authorize('admin'), async (req, res) => {
  try {
    const { role } = req.body;

    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({
        message: 'Papel inválido'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'Usuário não encontrado'
      });
    }

    res.json(user);
  } catch (error) {
    res.status(400).json({
      message: 'Erro ao atualizar papel do usuário',
      error: error.message
    });
  }
});

module.exports = router; 