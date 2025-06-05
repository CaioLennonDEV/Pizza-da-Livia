const express = require('express');
const router = express.Router();
const Order = require('../models/order.model');
const { protect, authorize } = require('../middlewares/auth.middleware');

// Criar novo pedido
router.post('/', protect, async (req, res) => {
  try {
    const orderData = {
      ...req.body,
      user: req.user._id
    };

    const order = await Order.create(orderData);
    await order.populate('items.product');

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({
      message: 'Erro ao criar pedido',
      error: error.message
    });
  }
});

// Listar pedidos do usuário
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product')
      .sort('-createdAt');

    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: 'Erro ao listar pedidos',
      error: error.message
    });
  }
});

// Listar todos os pedidos (apenas admin)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .populate('items.product')
      .sort('-createdAt');

    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: 'Erro ao listar pedidos',
      error: error.message
    });
  }
});

// Obter pedido por ID
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product');

    if (!order) {
      return res.status(404).json({
        message: 'Pedido não encontrado'
      });
    }

    // Verificar se o usuário tem permissão para ver o pedido
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Não autorizado a ver este pedido'
      });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({
      message: 'Erro ao obter pedido',
      error: error.message
    });
  }
});

// Atualizar status do pedido (apenas admin)
router.patch('/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        message: 'Status é obrigatório'
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
      .populate('user', 'name email phone')
      .populate('items.product');

    if (!order) {
      return res.status(404).json({
        message: 'Pedido não encontrado'
      });
    }

    res.json(order);
  } catch (error) {
    res.status(400).json({
      message: 'Erro ao atualizar status do pedido',
      error: error.message
    });
  }
});

// Cancelar pedido
router.patch('/:id/cancel', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: 'Pedido não encontrado'
      });
    }

    // Verificar se o usuário tem permissão para cancelar o pedido
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Não autorizado a cancelar este pedido'
      });
    }

    // Verificar se o pedido pode ser cancelado
    if (!['Pendente', 'Confirmado'].includes(order.status)) {
      return res.status(400).json({
        message: 'Este pedido não pode mais ser cancelado'
      });
    }

    order.status = 'Cancelado';
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(400).json({
      message: 'Erro ao cancelar pedido',
      error: error.message
    });
  }
});

module.exports = router; 