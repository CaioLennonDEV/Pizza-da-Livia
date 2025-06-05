const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
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

// Função para imprimir informações de debug sobre variáveis de ambiente
const logEnvironmentInfo = () => {
  console.log('\n=== Informações do Ambiente ===');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('PORT:', process.env.PORT);
  
  // Procura por variáveis relacionadas ao MongoDB
  const mongoVars = Object.keys(process.env).filter(key => 
    key.includes('MONGO') || key.includes('DB_')
  );
  
  console.log('\nVariáveis relacionadas ao MongoDB:');
  mongoVars.forEach(key => {
    console.log(`${key}: ${key.includes('URI') ? '[VALOR OCULTO]' : process.env[key]}`);
  });
  
  console.log('\nVariáveis do Render:');
  console.log('RENDER_SERVICE_ID:', process.env.RENDER_SERVICE_ID);
  console.log('RENDER_INSTANCE_ID:', process.env.RENDER_INSTANCE_ID);
  console.log('RENDER_SERVICE_TYPE:', process.env.RENDER_SERVICE_TYPE);
};

// Database connection
const connectDB = async () => {
  try {
    // Imprime informações de debug
    logEnvironmentInfo();

    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('URI do MongoDB não está definida nas variáveis de ambiente');
    }

    console.log('\nTentando conectar ao MongoDB...');
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
    });
    
    console.log('📦 Conectado ao MongoDB com sucesso!');
  } catch (err) {
    console.error('\nErro na conexão com MongoDB:', {
      mensagem: err.message,
      codigo: err.code,
      tipo: err.name,
      stack: err.stack
    });
    
    // Tenta reconectar após 5 segundos
    console.log('Tentando reconectar em 5 segundos...');
    setTimeout(connectDB, 5000);
  }
};

// Conexão inicial com o banco de dados
connectDB();

// Eventos de conexão do MongoDB
mongoose.connection.on('connected', () => {
  console.log('Mongoose conectado ao MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Erro na conexão do Mongoose:', {
    mensagem: err.message,
    codigo: err.code,
    tipo: err.name
  });
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose desconectado do MongoDB');
});

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