const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        message: 'Acesso não autorizado. Por favor, faça login.'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
      next();
    } catch (error) {
      return res.status(401).json({
        message: 'Token inválido ou expirado'
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao autenticar usuário'
    });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Usuário não tem permissão para acessar este recurso'
      });
    }
    next();
  };
}; 