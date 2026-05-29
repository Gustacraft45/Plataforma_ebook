const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// IMPORT DAS ROTAS AQUI
const authRoutes = require('./routes/authRoutes');
const evaluateRoutes = require('./routes/evaluateRoutes');

const app = express();
const PORT = 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Conexão com o MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('🍃 Conectado ao MongoDB com sucesso!'))
  .catch((err) => console.error('❌ Erro ao conectar ao MongoDB:', err));

// LINKAR AS ROTAS NO SERVIDOR
app.use('/api/auth', authRoutes);
app.use('/api/evaluate', evaluateRoutes);
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
// Rota de teste
app.get('/', (req, res) => {
  res.send('O servidor do e-book está online e conectado ao banco!');
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});