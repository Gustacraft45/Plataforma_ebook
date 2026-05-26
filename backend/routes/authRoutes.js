const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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

// ROTA DE LOGIN: http://localhost:5000/api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Procurar o usuário pelo e-mail
    const user = await User.findOne({ email });
    if (!user) {
      // Retornamos um erro genérico por segurança (para não avisar se o erro foi no email ou na senha)
      return res.status(400).json({ message: 'Credenciais inválidas.' });
    }

    // 2. Comparar a senha digitada com a senha criptografada do banco
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciais inválidas.' });
    }

    // 3. Criar o Token JWT (Crachá Virtual)
    const token = jwt.sign(
      { userId: user._id }, // Guardamos o ID do usuário dentro do token
      process.env.JWT_SECRET, // Assinamos com a nossa palavra secreta
      { expiresIn: '1d' } // O token vale por 1 dia
    );

    // 4. Devolver o token e os dados básicos do usuário para o Frontend
    res.json({
      message: 'Login bem-sucedido!',
      token,
      user: {
        id: user._id,
        name: user.name,
        xp: user.xp
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro no servidor ao fazer login.' });
  }
});
module.exports = router;