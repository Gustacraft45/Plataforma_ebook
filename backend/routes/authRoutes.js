const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Importa o molde de Usuário que criamos antes

// ROTA DE CADASTRO: http://localhost:5000/api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Verificar se o usuário já existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Este e-mail já está cadastrado.' });
    }

    // 2. Criptografar a senha para ninguém ver no banco
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Criar o novo usuário com a senha protegida
    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });

    // 4. Salvar no MongoDB
    await newUser.save();

    res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor ao cadastrar usuário.' });
  }
});

module.exports = router;