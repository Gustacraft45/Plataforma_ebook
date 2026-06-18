// backend/scripts/sendWeeklyEmails.js
// Script para disparo semanal de e-mails motivacionais.
//
// Execute manualmente:
//   node backend/scripts/sendWeeklyEmails.js
//
// Ou agende com cron (todo domingo às 10h):
//   0 10 * * 0  cd /seu/projeto && node backend/scripts/sendWeeklyEmails.js >> logs/email.log 2>&1
//
// Requer: ADMIN_EMAIL_KEY no .env e servidor backend rodando.

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const API_URL  = process.env.API_URL || 'http://localhost:5000';
const API_KEY  = process.env.ADMIN_EMAIL_KEY;

if (!API_KEY) {
  console.error('❌ ADMIN_EMAIL_KEY não definida no .env');
  process.exit(1);
}

async function run() {
  console.log(`[${new Date().toISOString()}] Iniciando disparo semanal de e-mails...`);

  try {
    const res = await fetch(`${API_URL}/api/email/send-all`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
    });

    const data = await res.json();

    if (res.ok) {
      console.log(`✅ ${data.message}`);
      if (data.erros && data.erros.length > 0) {
        console.warn('⚠️  Falhas:');
        data.erros.forEach(e => console.warn(`   - ${e.email}: ${e.erro}`));
      }
    } else {
      console.error('❌ Erro na API:', data.message);
    }
  } catch (err) {
    console.error('❌ Erro de conexão:', err.message);
  }
}

run();