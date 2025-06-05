const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('./config/database');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Database connection and sync
const initializeDatabase = async () => {
  try {
    console.log('\nConectando ao banco de dados SQLite...');
    await sequelize.authenticate();
    console.log('Conexão estabelecida com sucesso.');

    console.log('Sincronizando modelos com o banco de dados...');
    await sequelize.sync();
    console.log('Banco de dados sincronizado com sucesso.');
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    process.exit(1);
  }
};

// Initialize database
initializeDatabase();

// Routes
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const userRoutes = require('./routes/user.routes');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Erro na aplicação:', err.stack);
  res.status(500).json({ message: 'Algo deu errado!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
}); 