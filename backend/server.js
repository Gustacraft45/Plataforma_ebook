const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Conexão com o MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('🍃 Conectado ao MongoDB com sucesso!'))
  .catch((err) => console.error('❌ Erro ao conectar ao MongoDB:', err));

// Rota de teste
app.get('/', (req, res) => {
  res.send('O servidor do e-book está online e conectado ao banco!');
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});