// backend/routes/emailRoutes.js
// Rotas para disparo de e-mails motivacionais
//
// Endpoints:
//   POST /api/email/send-me        — leitor/escritor solicita seu próprio e-mail (teste)
//   POST /api/email/send-all       — admin dispara para todos os usuários (cron job)

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Book = require('../models/Book');
const auth = require('../middleware/auth');
const { sendMotivationalEmail } = require('../services/emailService');

// ─── Helpers de dados ────────────────────────────────────────────────────────

/**
 * Monta o objeto analytics para um leitor
 * (igual à rota GET /api/user/analytics, reutilizando a lógica)
 */
async function buildReaderAnalytics(user) {
  const progressDetails = await Promise.all(user.progress.map(async (p) => {
    let bookInfo = null;
    const mongoose = require('mongoose');
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

  const materias = {};
  progressDetails.forEach(p => {
    materias[p.materia] = (materias[p.materia] || 0) + 1;
  });

  const total = user.answerLog.length;
  const corretos = user.answerLog.filter(a => a.status === 'correto').length;
  const parciais = user.answerLog.filter(a => a.status === 'parcial').length;

  const ultimas7 = user.sessions.slice(-7);
  const totalMinRead = ultimas7.reduce((s, d) => s + d.minutesRead, 0);
  const mediaMinDia = ultimas7.length > 0 ? Math.round(totalMinRead / ultimas7.length) : 0;

  return {
    xp: user.xp,
    nivel: Math.floor(user.xp / 100) + 1,
    taxaAcerto: total > 0 ? Math.round((corretos / total) * 100) : 0,
    taxaAprendizado: total > 0 ? Math.round(((corretos + parciais) / total) * 100) : 0,
    totalRespostas: total,
    livrosIniciados: user.progress.length,
    distribuicaoMaterias: materias,
    progressoLivros: progressDetails,
    sessoes: ultimas7,
    mediaMinutosDia: mediaMinDia,
  };
}

/**
 * Monta o objeto com dados de livros para um escritor
 */
async function buildWriterData(user) {
  const livros = await Book.find({ authorId: user._id }).select('title subject nodes');
  const totalCenas = livros.reduce((sum, b) => sum + (b.nodes?.length || 0), 0);

  return {
    totalLivros: livros.length,
    totalCenas,
    livros: livros.map(b => ({
      title: b.title,
      subject: b.subject,
      nodeCount: b.nodes?.length || 0,
      nodes: b.nodes?.length || 0,
    })),
  };
}

// ─── POST /api/email/send-me ─────────────────────────────────────────────────
// O próprio usuário logado solicita o envio (ótimo para testar no frontend)
router.post('/send-me', auth, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

    let extraData;
    if (user.role === 'leitor') {
      extraData = await buildReaderAnalytics(user);
    } else {
      extraData = await buildWriterData(user);
    }

    await sendMotivationalEmail(user, extraData);

    res.json({ message: `E-mail motivacional enviado para ${user.email}!` });
  } catch (err) {
    console.error('[emailRoutes] Erro ao enviar e-mail:', err);
    res.status(500).json({ message: 'Erro ao enviar e-mail.', detail: err.message });
  }
});

// ─── POST /api/email/send-all ────────────────────────────────────────────────
// Dispara para todos os usuários. Protegido por API_KEY no header.
// Use em um cron job semanal: Authorization: Bearer <ADMIN_EMAIL_KEY>
//
// No .env, adicione: ADMIN_EMAIL_KEY=sua_chave_secreta
router.post('/send-all', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token || token !== process.env.ADMIN_EMAIL_KEY) {
    return res.status(403).json({ message: 'Acesso não autorizado.' });
  }

  try {
    const users = await User.find().select('-password');

    const results = { enviados: 0, falhas: 0, erros: [] };

    for (const user of users) {
      try {
        let extraData;
        if (user.role === 'leitor') {
          extraData = await buildReaderAnalytics(user);
        } else {
          extraData = await buildWriterData(user);
        }

        await sendMotivationalEmail(user, extraData);
        results.enviados++;
      } catch (err) {
        results.falhas++;
        results.erros.push({ email: user.email, erro: err.message });
      }
    }

    res.json({
      message: `Envio concluído: ${results.enviados} sucesso(s), ${results.falhas} falha(s).`,
      ...results,
    });
  } catch (err) {
    console.error('[emailRoutes] Erro no envio em massa:', err);
    res.status(500).json({ message: 'Erro ao disparar e-mails.', detail: err.message });
  }
});

module.exports = router;