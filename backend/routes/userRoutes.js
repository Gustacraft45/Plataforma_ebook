const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Book = require('../models/Book');
const mongoose = require('mongoose'); // Importado para validar o formato do ID antes de bater no banco
const auth = require('../middleware/auth'); // O porteiro que extrai o ID do token

// ROTA PARA ATUALIZAR PROGRESSO E DAR XP (PATCH)
// http://localhost:5000/api/user/progress
router.patch('/progress', auth, async (req, res) => {
  try {
    const { bookId, currentNode, isCorrect } = req.body;
    
    // --> A VERIFICAÇÃO QUE VOCÊ SUGERIU COMEÇA AQUI <--
    // Valida se o formato do ID é aceito pelo MongoDB para evitar o CastError
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ message: 'Erro: O formato do ID do livro é inválido.' });
    }

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
// =======================================================
// ROTA 2: BUSCAR DADOS DO PERFIL (GET) - Para a Dashboard
// http://localhost:5000/api/user/me
// =======================================================
router.get('/me', auth, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id; 
    
    // Busca o usuário, mas esconde a senha por segurança
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    res.json(user);
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    res.status(500).json({ message: 'Erro no servidor ao buscar o perfil.' });
  }
});

// =======================================================
// ROTA 3: GERAR RELATÓRIO DE DADOS PARA PYTHON (GET)
// http://localhost:5000/api/user/report
// =======================================================
router.get('/report', auth, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id; 
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // Vamos cruzar os dados de progresso com os livros reais para montar o relatório
    let materiasLidas = {};
    const detalhesProgresso = await Promise.all(user.progress.map(async (p) => {
      // Usamos a verificação de ObjectId para não quebrar caso haja um ID de teste antigo
      let bookInfo = null;
      if (mongoose.Types.ObjectId.isValid(p.bookId)) {
        bookInfo = await Book.findById(p.bookId);
      }

      const materia = bookInfo ? bookInfo.subject : "Desconhecida";

      // Contabiliza as preferências de matérias do usuário
      if (bookInfo) {
        materiasLidas[materia] = (materiasLidas[materia] || 0) + 1;
      }

      return {
        id_livro: p.bookId,
        titulo_livro: bookInfo ? bookInfo.title : "Livro Excluído",
        materia: materia,
        cena_parada: p.currentNode
      };
    }));

    // Determina a matéria favorita (A que mais aparece)
    let materiaFavorita = "Nenhuma ainda";
    if (Object.keys(materiasLidas).length > 0) {
      materiaFavorita = Object.keys(materiasLidas).reduce((a, b) => materiasLidas[a] > materiasLidas[b] ? a : b);
    }

    // Monta o Objeto Final perfeitamente formatado para um DataFrame do Python (Pandas)
    const reportData = {
      aluno: {
        id: user._id,
        nome: user.name,
        email: user.email,
        xp_total: user.xp,
        cadastrado_em: user.createdAt
      },
      metricas: {
        total_livros_iniciados: user.progress.length,
        materia_favorita: materiaFavorita,
        distribuicao_materias: materiasLidas
      },
      historico_leitura: detalhesProgresso,
      data_geracao_relatorio: new Date().toISOString()
    };

    res.json(reportData);

  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
    res.status(500).json({ message: 'Erro no servidor ao gerar o relatório.' });
  }
});
module.exports = router;