const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role)
      return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });

    if (!['leitor', 'escritor'].includes(role))
      return res.status(400).json({ message: 'Tipo de usuário inválido.' });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: 'E-mail já cadastrado.' });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed, role });
    await user.save();

    res.status(201).json({ message: 'Conta criada com sucesso!' });
  } catch (err) {
    res.status(500).json({ message: 'Erro no servidor.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Credenciais inválidas.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Credenciais inválidas.' });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, xp: user.xp }
    });
  } catch (err) {
    res.status(500).json({ message: 'Erro no servidor.' });
  }
});

module.exports = router;
