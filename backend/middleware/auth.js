const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Pega o token do cabeçalho da requisição
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
  }

  // O token geralmente vem como "Bearer hdauishdiasuhd", então pegamos só a segunda parte
  const token = authHeader.split(' ')[1];

  try {
    // Tenta verificar se o crachá é verdadeiro usando a nossa senha secreta
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // Salva os dados do usuário na requisição
    next(); // Deixa o usuário passar para a rota
  } catch (err) {
    res.status(401).json({ message: 'Token inválido ou expirado.' });
  }
};