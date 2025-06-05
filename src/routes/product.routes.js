const express = require('express');
const router = express.Router();
const Product = require('../models/product.model');
const { protect, authorize } = require('../middlewares/auth.middleware');
const multer = require('multer');
const path = require('path');

// Configuração do Multer para upload de imagens
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/products');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Apenas imagens são permitidas'));
  }
});

// Listar todos os produtos
router.get('/', async (req, res) => {
  try {
    const { category, available, featured } = req.query;
    const query = {};

    if (category) query.category = category;
    if (available !== undefined) query.available = available === 'true';
    if (featured !== undefined) query.featured = featured === 'true';

    const products = await Product.find(query).sort('-createdAt');
    res.json(products);
  } catch (error) {
    res.status(500).json({
      message: 'Erro ao listar produtos',
      error: error.message
    });
  }
});

// Obter produto por ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        message: 'Produto não encontrado'
      });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({
      message: 'Erro ao obter produto',
      error: error.message
    });
  }
});

// Criar novo produto (apenas admin)
router.post('/', protect, authorize('admin'), upload.single('image'), async (req, res) => {
  try {
    const productData = {
      ...req.body,
      image: `/uploads/products/${req.file.filename}`
    };

    if (req.body.sizes) {
      productData.sizes = JSON.parse(req.body.sizes);
    }

    if (req.body.ingredients) {
      productData.ingredients = JSON.parse(req.body.ingredients);
    }

    const product = await Product.create(productData);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({
      message: 'Erro ao criar produto',
      error: error.message
    });
  }
});

// Atualizar produto (apenas admin)
router.put('/:id', protect, authorize('admin'), upload.single('image'), async (req, res) => {
  try {
    const productData = { ...req.body };

    if (req.file) {
      productData.image = `/uploads/products/${req.file.filename}`;
    }

    if (req.body.sizes) {
      productData.sizes = JSON.parse(req.body.sizes);
    }

    if (req.body.ingredients) {
      productData.ingredients = JSON.parse(req.body.ingredients);
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      productData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        message: 'Produto não encontrado'
      });
    }

    res.json(product);
  } catch (error) {
    res.status(400).json({
      message: 'Erro ao atualizar produto',
      error: error.message
    });
  }
});

// Excluir produto (apenas admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: 'Produto não encontrado'
      });
    }

    res.json({
      message: 'Produto excluído com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Erro ao excluir produto',
      error: error.message
    });
  }
});

module.exports = router; 