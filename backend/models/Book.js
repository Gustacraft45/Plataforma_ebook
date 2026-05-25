const mongoose = require('mongoose');

const NodeSchema = new mongoose.Schema({
  id: { type: String, required: true }, // Ex: "cena_1"
  title: { type: String, required: true }, // Título do conceito (ex: "Introdução a Variáveis")
  storyText: { type: String, required: true }, // A fala narrativa do personagem do e-book
  challengeQuestion: { type: String, required: true } // A pergunta/desafio que a IA vai avaliar
});

const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true }, // Área/Matéria (ex: Matemática, Programação)
  characterName: { type: String, required: true }, // Nome do personagem que guia a história
  nodes: [NodeSchema] // Uma lista com todas as cenas/páginas do livro
}, { timestamps: true });

module.exports = mongoose.model('Book', BookSchema);