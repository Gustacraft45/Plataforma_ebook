const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Book = require('../models/Book');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');

const userId = (req) => req.user.userId || req.user.id || req.user._id;

// PATCH /api/user/progress — salva progresso, resposta e sessão
router.patch('/progress', auth, async (req, res) => {
  try {
    const { bookId, nodeId, currentNode, isCorrect, status, minutesRead, minutesIdle } = req.body;

    if (!mongoose.Types.ObjectId.isValid(bookId))
      return res.status(400).json({ message: 'ID do livro inválido.' });

    const bookExists = await Book.findById(bookId);
    if (!bookExists) return res.status(404).json({ message: 'Livro não encontrado.' });

    const user = await User.findById(userId(req));
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

    // Normaliza status (IA pode retornar 'correct', 'correto', 'Correto', etc.)
    const normalizeStatus = (s) => {
      if (!s) return null;
      const sl = s.toLowerCase();
      if (sl === 'correct' || sl === 'correto') return 'correto';
      if (sl === 'partial' || sl === 'parcial') return 'parcial';
      return 'errado';
    };
    const statusNorm = normalizeStatus(status);

    // XP
    if (statusNorm === 'correto') user.xp += 100;
    else if (statusNorm === 'parcial') user.xp += 50;

    // Progresso no livro
    const idx = user.progress.findIndex(p => p.bookId?.toString() === bookId);
    if (idx > -1) {
      user.progress[idx].currentNode = currentNode;
    } else {
      user.progress.push({ bookId, currentNode });
    }

    // Log de resposta para analytics
    if (statusNorm) {
      user.answerLog.push({ bookId, nodeId, status: statusNorm });
    }

    // Sessão do dia
    if (minutesRead !== undefined || minutesIdle !== undefined) {
      const today = new Date().toISOString().split('T')[0];
      const sIdx = user.sessions.findIndex(s => s.date === today);
      if (sIdx > -1) {
        user.sessions[sIdx].minutesRead += (minutesRead || 0);
        user.sessions[sIdx].minutesIdle += (minutesIdle || 0);
      } else {
        user.sessions.push({ date: today, minutesRead: minutesRead || 0, minutesIdle: minutesIdle || 0 });
      }
    }

    await user.save();
    res.json({ message: 'Progresso salvo!', xpTotal: user.xp, progress: user.progress });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao salvar progresso.' });
  }
});

// GET /api/user/me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(userId(req)).select('-password');
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar perfil.' });
  }
});

// GET /api/user/analytics — dados completos para o dashboard
router.get('/analytics', auth, async (req, res) => {
  try {
    const user = await User.findById(userId(req)).select('-password');
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

    // Cruzar progresso com livros
    const progressDetails = await Promise.all(user.progress.map(async (p) => {
      let bookInfo = null;
      if (mongoose.Types.ObjectId.isValid(p.bookId))
        bookInfo = await Book.findById(p.bookId).select('title subject nodes');

      const nodesDone = bookInfo
        ? bookInfo.nodes.findIndex(n => n.id === p.currentNode) + 1
        : 0;
      const totalNodes = bookInfo ? bookInfo.nodes.length : 0;

      return {
        bookId: p.bookId,
        titulo: bookInfo?.title || 'Livro excluído',
        materia: bookInfo?.subject || 'Desconhecida',
        cenesCompletas: nodesDone,
        totalCenas: totalNodes,
        percentual: totalNodes > 0 ? Math.round((nodesDone / totalNodes) * 100) : 0,
      };
    }));

    // Distribuição por matéria
    const materias = {};
    progressDetails.forEach(p => {
      materias[p.materia] = (materias[p.materia] || 0) + 1;
    });

    // Taxa de acerto e aprendizado
    const total = user.answerLog.length;
    const corretos = user.answerLog.filter(a => a.status === 'correto').length;
    const parciais = user.answerLog.filter(a => a.status === 'parcial').length;
    const taxaAcerto = total > 0 ? Math.round((corretos / total) * 100) : 0;
    const taxaAprendizado = total > 0 ? Math.round(((corretos + parciais) / total) * 100) : 0;

    // Sessões — últimos 7 dias
    const ultimas7 = user.sessions.slice(-7);
    const totalMinRead = ultimas7.reduce((s, d) => s + d.minutesRead, 0);
    const totalMinIdle = ultimas7.reduce((s, d) => s + d.minutesIdle, 0);
    const mediaMinDia = ultimas7.length > 0 ? Math.round(totalMinRead / ultimas7.length) : 0;

    res.json({
      xp: user.xp,
      nivel: Math.floor(user.xp / 100) + 1,
      taxaAcerto,
      taxaAprendizado,
      totalRespostas: total,
      livrosIniciados: user.progress.length,
      distribuicaoMaterias: materias,
      progressoLivros: progressDetails,
      sessoes: ultimas7,
      mediaMinutosDia: mediaMinDia,
      totalMinutosOcioso: totalMinIdle,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao gerar analytics.' });
  }
});

// GET /api/user/report — exportação para Python/Excel
router.get('/report', auth, async (req, res) => {
  try {
    const user = await User.findById(userId(req)).select('-password');
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

    const progressDetails = await Promise.all(user.progress.map(async (p) => {
      let bookInfo = null;
      if (mongoose.Types.ObjectId.isValid(p.bookId))
        bookInfo = await Book.findById(p.bookId).select('title subject nodes');
      const nodesDone = bookInfo
        ? bookInfo.nodes.findIndex(n => n.id === p.currentNode) + 1
        : 0;
      return {
        id_livro: p.bookId,
        titulo: bookInfo?.title || 'Excluído',
        materia: bookInfo?.subject || 'Desconhecida',
        cenas_completas: nodesDone,
        total_cenas: bookInfo?.nodes.length || 0,
      };
    }));

    const total = user.answerLog.length;
    const corretos = user.answerLog.filter(a => a.status === 'correto').length;
    const parciais = user.answerLog.filter(a => a.status === 'parcial').length;

    const materias = {};
    progressDetails.forEach(p => { materias[p.materia] = (materias[p.materia] || 0) + 1; });
    const materiaFavorita = Object.keys(materias).length > 0
      ? Object.keys(materias).reduce((a, b) => materias[a] > materias[b] ? a : b)
      : 'Nenhuma ainda';

    res.json({
      aluno: {
        id: user._id,
        nome: user.name,
        email: user.email,
        role: user.role,
        xp_total: user.xp,
        nivel: Math.floor(user.xp / 100) + 1,
        cadastrado_em: user.createdAt,
      },
      metricas: {
        total_livros_iniciados: user.progress.length,
        total_respostas: total,
        respostas_corretas: corretos,
        respostas_parciais: parciais,
        respostas_erradas: total - corretos - parciais,
        taxa_acerto_pct: total > 0 ? Math.round((corretos / total) * 100) : 0,
        taxa_aprendizado_pct: total > 0 ? Math.round(((corretos + parciais) / total) * 100) : 0,
        materia_favorita: materiaFavorita,
        distribuicao_materias: materias,
      },
      sessoes: user.sessions,
      historico_leitura: progressDetails,
      log_respostas: user.answerLog,
      data_geracao: new Date().toISOString(),
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao gerar relatório.' });
  }
});

module.exports = router;
