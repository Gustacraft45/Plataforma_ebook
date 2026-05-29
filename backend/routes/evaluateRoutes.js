const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const auth = require('../middleware/auth');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Colocamos o 'auth' no meio da rota. Agora só passa quem tem crachá!
router.post('/', auth, async (req, res) => {
  try {
    const { question, studentAnswer } = req.body;

    // --- NOVA VALIDAÇÃO DE ENTRADA ---
    if (!question || !studentAnswer) {
      return res.status(400).json({ message: 'A pergunta e a resposta do aluno são obrigatórias.' });
    }
    // ---------------------------------

    const promptText = `Você é um professor avaliando a resposta de um aluno.
    Pergunta do desafio: "${question}"
    Resposta do aluno: "${studentAnswer}"

    Responda APENAS em formato JSON puro. O JSON deve conter obrigatoriamente estas duas chaves:
    "status": "correto", "parcial" ou "errado"
    "feedback": "uma frase curta e amigável explicando o motivo e orientando o aluno"`;

    // Chama a API da Groq usando o modelo Llama 3 (muito rápido)
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "user", content: promptText }
      ],
      model: "llama-3.1-8b-instant", // Modelo gratuito e veloz
      temperature: 0.5,
      response_format: { type: "json_object" } // Força a IA a devolver um JSON perfeito
    });

    // Pega o texto da resposta e transforma em JSON para o Backend
    const aiResponse = JSON.parse(chatCompletion.choices[0].message.content);

    res.json(aiResponse);

  } catch (error) {
    console.error("Erro na IA:", error);
    res.status(500).json({ message: 'Erro ao conectar com a IA da Groq.' });
  }
});

module.exports = router;