const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Book = require('../models/Book');
const auth = require('../middleware/auth'); // O porteiro que extrai o ID do token

// ROTA PARA ATUALIZAR PROGRESSO E DAR XP (PATCH)
// http://localhost:5000/api/user/progress
router.patch('/progress', auth, async (req, res) => {
  try {
    const { bookId, currentNode, isCorrect } = req.body;
    
    // --> A VERIFICAÇÃO QUE VOCÊ SUGERIU COMEÇA AQUI <--
    const bookExists = await Book.findById(bookId);
    if (!bookExists) {
      return res.status(404).json({ message: 'Erro: Este livro não existe no sistema.' });
    }
    // req.user vem do nosso middleware auth.js (você precisa garantir que o auth.js salva o ID no req.user.id ou req.user._id)
    const userId = req.user.userId || req.user.id || req.user._id; 

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // 1. Lógica do XP: Se a IA disse que acertou, toma +50 XP!
    if (isCorrect) {
      user.xp += 50; 
    }

    // 2. Lógica do Progresso: Procura se o aluno já começou esse livro antes
    const progressIndex = user.progress.findIndex(p => p.bookId === bookId);

    if (progressIndex > -1) {
      // Se já existe, só atualiza para o nó/página em que ele está agora
      user.progress[progressIndex].currentNode = currentNode;
    } else {
      // Se é a primeira vez lendo, cria o registro do livro no array
      user.progress.push({ bookId, currentNode });
    }

    await user.save(); // Salva no banco de dados!

    res.json({ 
      message: 'Progresso salvo com sucesso!', 
      xpTotal: user.xp,
      progress: user.progress
    });

  } catch (error) {
    console.error("Erro ao salvar progresso:", error);
    res.status(500).json({ message: 'Erro no servidor ao atualizar progresso.' });
  }
});

module.exports = router;