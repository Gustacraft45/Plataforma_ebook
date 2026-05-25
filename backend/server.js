const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 5000;

// Configurações para o servidor entender JSON e aceitar requisições do Frontend
app.use(cors());
app.use(express.json());

// Rota de teste para ver se está funcionando
app.get('/', (req, res) => {
  res.send('O servidor do e-book está online e rodando perfeitamente!');
});

// Inicializa o servidor na porta 5000
app.listen(PORT, () => {
  console.log(`Servidor rodando com sucesso na porta ${PORT}`);
});