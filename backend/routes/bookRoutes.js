const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const auth = require('../middleware/auth'); // Nosso porteiro protetor

// 1. ROTA PARA CADASTRAR UM LIVRO COMPLETO (POST)
// http://localhost:5000/api/books/create
router.post('/create', async (req, res) => {
  try {
    const { title, subject, characterName, nodes } = req.body;

    // Validação simples dos campos principais
    if (!title || !subject || !characterName || !nodes || nodes.length === 0) {
      return res.status(400).json({ message: 'Todos os campos do livro e pelo menos uma cena (node) são obrigatórios.' });
    }

    const newBook = new Book({ title, subject, characterName, nodes });
    await newBook.save();

    res.status(201).json({ message: 'Livro interativo cadastrado com sucesso!', book: newBook });
  } catch (error) {
    console.error("Erro ao cadastrar o livro:", error);
    res.status(500).json({ message: 'Erro ao cadastrar o livro no banco de dados.' });
  }
});

// 2. ROTA PARA LISTAR TODOS OS LIVROS (GET) - Protegida por Token
// http://localhost:5000/api/books
router.get('/', auth, async (req, res) => {
  try {
    // Traz a lista de livros mostrando apenas Título, Matéria e Nome do Personagem (sem pesar a requisição com o texto todo)
    const books = await Book.find().select('title subject characterName');
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar a lista de livros.' });
  }
});

// 3. ROTA PARA BUSCAR UM LIVRO DETALHADO PELO ID (GET) - Protegida por Token
// http://localhost:5000/api/books/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Livro interativo não encontrado.' });
    }
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar os detalhes do livro.' });
  }
});

module.exports = router;