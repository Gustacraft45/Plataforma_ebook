// backend/services/emailService.js
// Serviço de e-mails motivacionais — usa nodemailer com Gmail
// Instale: npm install nodemailer

const nodemailer = require('nodemailer');

// ─── Configuração do Gmail ──────────────────────────────────────────────────
// No .env, adicione:
//   SMTP_USER=seuemail@gmail.com
//   SMTP_PASS=sua_senha_de_app
//   EMAIL_FROM="Arcano Saber <seuemail@gmail.com>"
//
// Senha de app: myaccount.google.com → Segurança → Senhas de app

function createTransporter() {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('SMTP_USER ou SMTP_PASS não definidos no .env');
  }
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// ─── Template base (compartilhado) ─────────────────────────────────────────
function baseTemplate({ preheader, body, footerNote }) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Arcano Saber</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Nunito:wght@400;600;700&display=swap');
    body { margin:0; padding:0; background:#faf6f0; font-family:'Nunito',Arial,sans-serif; color:#5a4a3a; }
    .wrap { max-width:600px; margin:0 auto; }
    .header { background:linear-gradient(135deg,#8b5e3c,#6b3e1c); padding:32px 40px; border-radius:16px 16px 0 0; text-align:center; }
    .header-logo { font-family:'Playfair Display',Georgia,serif; font-size:28px; color:#fff8f0; font-weight:700; letter-spacing:1px; }
    .header-sub { font-size:13px; color:#d4a882; margin-top:4px; }
    .body { background:#fff; padding:36px 40px; }
    .greeting { font-size:20px; font-weight:700; color:#3a2a1a; margin-bottom:8px; }
    .intro { font-size:15px; line-height:1.7; color:#6a5a4a; margin-bottom:28px; }
    .stat-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:28px; }
    .stat-card { background:#faf6f0; border:1.5px solid #e8ddd0; border-radius:12px; padding:16px 18px; text-align:center; }
    .stat-icon { font-size:24px; margin-bottom:4px; }
    .stat-value { font-size:24px; font-weight:700; color:#8b5e3c; font-family:'Playfair Display',serif; }
    .stat-label { font-size:12px; color:#9a8878; margin-top:2px; }
    .section-title { font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:#9a8878; margin-bottom:12px; }
    .genre-list { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:28px; }
    .genre-tag { background:#f0e8dd; border:1px solid #d4c4b0; border-radius:20px; padding:6px 14px; font-size:13px; color:#7a5a3a; font-weight:600; }
    .cta-btn { display:block; background:linear-gradient(135deg,#c4944a,#8b5e3c); color:#fff8f0 !important; text-decoration:none; text-align:center; padding:16px 32px; border-radius:12px; font-size:16px; font-weight:700; margin:24px 0; letter-spacing:.3px; }
    .tip-box { background:#fffdf7; border-left:4px solid #c4944a; border-radius:0 12px 12px 0; padding:16px 20px; margin-bottom:24px; font-size:14px; line-height:1.6; color:#6a5a4a; }
    .tip-box strong { color:#8b5e3c; }
    .progress-bar-wrap { background:#f0e8dd; border-radius:8px; height:10px; overflow:hidden; margin:8px 0 18px; }
    .progress-bar-fill { height:100%; background:linear-gradient(90deg,#c4944a,#e8b86d); border-radius:8px; }
    .footer { background:#faf6f0; border:1.5px solid #e8ddd0; border-top:none; border-radius:0 0 16px 16px; padding:24px 40px; text-align:center; }
    .footer p { font-size:12px; color:#b0a090; line-height:1.6; margin:0; }
    .footer a { color:#8b5e3c; text-decoration:none; }
    @media (max-width:480px) {
      .body, .footer { padding:28px 20px; }
      .stat-grid { grid-template-columns:1fr 1fr; gap:10px; }
    }
  </style>
</head>
<body>
  <!--[if mso]><table width="600" align="center"><tr><td><![endif]-->
  <div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>
  <div class="wrap">
    <div class="header">
      <div class="header-logo">📖 Arcano Saber</div>
      <div class="header-sub">Plataforma de leitura interativa</div>
    </div>
    <div class="body">
      ${body}
    </div>
    <div class="footer">
      <p>${footerNote}<br/>
      <a href="#">Cancelar inscrição</a> · <a href="#">Ver no navegador</a></p>
    </div>
  </div>
  <!--[if mso]></td></tr></table><![endif]-->
</body>
</html>`;
}

// ─── Template para LEITOR ───────────────────────────────────────────────────
function buildReaderEmail(user, analytics) {
  const {
    nivel = 1,
    xp = 0,
    taxaAcerto = 0,
    livrosIniciados = 0,
    distribuicaoMaterias = {},
    progressoLivros = [],
    mediaMinutosDia = 0,
  } = analytics;

  const xpProgress = xp % 100;
  const xpToNext = 100 - xpProgress;

  const melhorLivro = progressoLivros
    .sort((a, b) => b.percentual - a.percentual)[0];

  const materias = Object.entries(distribuicaoMaterias);
  const materiaFav = materias.sort((a, b) => b[1] - a[1])[0];

  let motivacao;
  if (taxaAcerto >= 80) {
    motivacao = `Você está <strong>dominando</strong> o conteúdo com ${taxaAcerto}% de acertos! Continue assim — você está perto do topo.`;
  } else if (taxaAcerto >= 50) {
    motivacao = `Você está progredindo bem com ${taxaAcerto}% de acertos. Cada desafio respondido te deixa mais perto do domínio total!`;
  } else if (taxaAcerto > 0) {
    motivacao = `Com ${taxaAcerto}% de acertos, há espaço para crescer. Releia os capítulos e tente novamente — a persistência é o segredo dos grandes leitores.`;
  } else {
    motivacao = `Sua jornada começa agora! Há livros incríveis esperando por você na plataforma. Cada página lida é um passo à frente.`;
  }

  const sugestaoLivro = melhorLivro
    ? `<p style="font-size:14px;color:#6a5a4a;margin-bottom:6px;">Continue onde parou:</p>
       <div class="stat-card" style="text-align:left;margin-bottom:24px;">
         <div style="font-weight:700;color:#3a2a1a;margin-bottom:6px;">📚 ${melhorLivro.titulo}</div>
         <div style="font-size:12px;color:#9a8878;margin-bottom:8px;">${melhorLivro.materia} · ${melhorLivro.cenesCompletas}/${melhorLivro.totalCenas} cenas</div>
         <div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${melhorLivro.percentual}%"></div></div>
         <div style="font-size:11px;color:#9a8878;">${melhorLivro.percentual}% concluído</div>
       </div>`
    : '';

  const genreTags = materias.length > 0
    ? materias.map(([m]) => `<span class="genre-tag">${m}</span>`).join('')
    : '<span class="genre-tag">Nenhuma ainda</span>';

  const body = `
    <div class="greeting">Olá, ${user.name}! 👋</div>
    <p class="intro">
      Passaram alguns dias desde sua última visita ao <strong>Arcano Saber</strong>. 
      Veja como está sua jornada de leitura e volte para continuar crescendo!
    </p>

    <div class="section-title">📊 Suas Estatísticas</div>
    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-icon">⭐</div>
        <div class="stat-value">Nv ${nivel}</div>
        <div class="stat-label">${xp} XP total</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📖</div>
        <div class="stat-value">${livrosIniciados}</div>
        <div class="stat-label">Livros iniciados</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🎯</div>
        <div class="stat-value">${taxaAcerto}%</div>
        <div class="stat-label">Taxa de acerto</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⏱️</div>
        <div class="stat-value">${mediaMinutosDia}min</div>
        <div class="stat-label">Média por dia</div>
      </div>
    </div>

    <div class="tip-box">
      💡 ${motivacao}
    </div>

    ${sugestaoLivro}

    ${materias.length > 0 ? `
    <div class="section-title">🗂️ Gêneros que você estuda</div>
    <div class="genre-list">${genreTags}</div>
    ${materiaFav ? `<p style="font-size:13px;color:#9a8878;margin-bottom:24px;">Sua matéria favorita é <strong style="color:#8b5e3c;">${materiaFav[0]}</strong> com ${materiaFav[1]} livro(s) iniciado(s).</p>` : ''}
    ` : ''}

    <div class="section-title">⚡ Progresso de Nível</div>
    <p style="font-size:13px;color:#9a8878;margin-bottom:4px;">Faltam <strong style="color:#8b5e3c;">${xpToNext} XP</strong> para o Nível ${nivel + 1}</p>
    <div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${xpProgress}%"></div></div>

    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" class="cta-btn">
      📚 Continuar Lendo Agora
    </a>

    <p style="font-size:13px;color:#9a8878;text-align:center;">
      Lembre-se: cada resposta certa te dá <strong>100 XP</strong>!
    </p>
  `;

  return {
    subject: `${user.name}, sua jornada de leitura está esperando! 📖`,
    preheader: `Nível ${nivel} · ${taxaAcerto}% de acertos · Continue de onde parou`,
    body,
    footerNote: `Você está recebendo este e-mail porque tem uma conta como <strong>Leitor</strong> no Arcano Saber.`,
  };
}

// ─── Template para ESCRITOR ────────────────────────────────────────────────
function buildWriterEmail(user, booksData) {
  const {
    totalLivros = 0,
    totalCenas = 0,
    livros = [],
  } = booksData;

  const livroDestaque = livros.sort((a, b) => (b.nodes || 0) - (a.nodes || 0))[0];

  const dicas = [
    { icon: '✍️', titulo: 'Comece pelo conflito', texto: 'Toda boa história começa com um problema. Na primeira cena, apresente um desafio que force o leitor a pensar. Isso garante engajamento imediato.' },
    { icon: '🧩', titulo: 'Cenas curtas funcionam melhor', texto: 'Livros com cenas focadas e desafios objetivos têm maior taxa de conclusão. Prefira 8 a 12 cenas bem elaboradas a muitas rasas.' },
    { icon: '🎯', titulo: 'Gabarito claro = melhor avaliação pela IA', texto: 'Quanto mais detalhado for o campo "resposta esperada", mais precisa será a correção automática pelo Groq. Use frases-chave e palavras centrais.' },
    { icon: '📐', titulo: 'Teste seu próprio livro', texto: 'Leia seu livro como um estudante após publicá-lo. Você vai descobrir cenas que podem ser mais claras ou desafios que precisam de ajuste.' },
    { icon: '🌟', titulo: 'Variedade de matérias', texto: 'Considere publicar livros em matérias diferentes. Isso atrai leitores de múltiplos perfis e aumenta o alcance do seu conteúdo.' },
  ];
  const dica = dicas[totalLivros % dicas.length];

  const livrosHtml = livros.slice(0, 3).map(l => `
    <div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid #f0e8dd;">
      <div style="width:40px;height:40px;background:linear-gradient(135deg,#c4944a,#8b5e3c);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">📕</div>
      <div style="flex:1;min-width:0;">
        <div style="font-weight:700;color:#3a2a1a;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${l.title}</div>
        <div style="font-size:12px;color:#9a8878;">${l.subject} · ${l.nodeCount} cena(s)</div>
      </div>
    </div>
  `).join('');

  const body = `
    <div class="greeting">Olá, ${user.name}! ✍️</div>
    <p class="intro">
      Você é um dos <strong>escritores</strong> que dão vida ao <strong>Arcano Saber</strong>. 
      Confira o estado da sua obra e inspire-se para criar novos conteúdos!
    </p>

    <div class="section-title">📊 Seus Números como Autor</div>
    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-icon">📚</div>
        <div class="stat-value">${totalLivros}</div>
        <div class="stat-label">Livro(s) publicado(s)</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🎬</div>
        <div class="stat-value">${totalCenas}</div>
        <div class="stat-label">Cenas no total</div>
      </div>
      ${livroDestaque ? `
      <div class="stat-card">
        <div class="stat-icon">🏆</div>
        <div class="stat-value">${livroDestaque.nodes || 0}</div>
        <div class="stat-label">Cenas no livro mais longo</div>
      </div>` : ''}
      <div class="stat-card">
        <div class="stat-icon">⭐</div>
        <div class="stat-value">${user.xp || 0}</div>
        <div class="stat-label">XP acumulado</div>
      </div>
    </div>

    ${livros.length > 0 ? `
    <div class="section-title">📕 Seus Livros</div>
    <div style="margin-bottom:24px;">${livrosHtml}</div>
    ` : `
    <div class="tip-box">
      🚀 Você ainda não publicou nenhum livro. <strong>Que tal começar agora?</strong> 
      Crie seu primeiro livro interativo e ajude estudantes a aprender de forma envolvente!
    </div>
    `}

    <div class="section-title">💡 Dica para Autores</div>
    <div class="tip-box">
      <strong>${dica.icon} ${dica.titulo}</strong><br/>
      ${dica.texto}
    </div>

    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/author" class="cta-btn">
      ✍️ Ir para o Painel do Autor
    </a>

    <p style="font-size:13px;color:#9a8878;text-align:center;">
      Seu conhecimento transforma estudantes. Obrigado por fazer parte do Arcano Saber!
    </p>
  `;

  return {
    subject: `${user.name}, veja como está sua obra no Arcano Saber ✍️`,
    preheader: `${totalLivros} livro(s) · ${totalCenas} cenas · Dica exclusiva para autores`,
    body,
    footerNote: `Você está recebendo este e-mail porque tem uma conta como <strong>Escritor</strong> no Arcano Saber.`,
  };
}

// ─── Função principal de envio ──────────────────────────────────────────────
async function sendMotivationalEmail(user, extraData) {
  const transporter = createTransporter();

  let emailContent;
  if (user.role === 'leitor') {
    emailContent = buildReaderEmail(user, extraData);
  } else if (user.role === 'escritor') {
    emailContent = buildWriterEmail(user, extraData);
  } else {
    throw new Error(`Role desconhecida: ${user.role}`);
  }

  const html = baseTemplate(emailContent);

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || `"Arcano Saber" <${process.env.SMTP_USER}>`,
    to: user.email,
    subject: emailContent.subject,
    html,
  });

  return info;
}

module.exports = { sendMotivationalEmail };