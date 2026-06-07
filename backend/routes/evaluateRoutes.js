const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const auth = require('../middleware/auth');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post('/', auth, async (req, res) => {
  try {
    const { question, studentAnswer, expectedAnswer } = req.body;

    if (!question || !studentAnswer)
      return res.status(400).json({ message: 'A pergunta e a resposta do aluno são obrigatórias.' });

    // Se o escritor forneceu um gabarito, o prompt usa como referência
    const gabaritoLine = expectedAnswer
      ? `\n    Resposta esperada (gabarito do professor): "${expectedAnswer}"`
      : '';

    const promptText = `Você é um professor avaliando a resposta de um aluno.
    Pergunta do desafio: "${question}"${gabaritoLine}
    Resposta do aluno: "${studentAnswer}"

    Responda APENAS em formato JSON puro. O JSON deve conter obrigatoriamente estas duas chaves:
    "status": "correto", "parcial" ou "errado"
    "feedback": "uma frase curta e amigável explicando o motivo e orientando o aluno"`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: promptText }],
      model: 'llama-3.1-8b-instant',
      temperature: 0.5,
      response_format: { type: 'json_object' },
    });

    const aiResponse = JSON.parse(chatCompletion.choices[0].message.content);
    res.json(aiResponse);

  } catch (err) {
    console.error('Erro na IA:', err);
    res.status(500).json({ message: 'Erro ao conectar com a IA da Groq.' });
  }
});

module.exports = router;
