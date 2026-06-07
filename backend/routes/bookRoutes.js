const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const auth = require('../middleware/auth');

// POST /api/books/create — só escritor pode criar
router.post('/create', auth, async (req, res) => {
  try {
    if (req.user.role !== 'escritor')
      return res.status(403).json({ message: 'Apenas escritores podem publicar livros.' });

    const { title, subject, characterName, nodes } = req.body;
    if (!title || !subject || !characterName || !nodes || nodes.length === 0)
      return res.status(400).json({ message: 'Todos os campos e pelo menos uma cena são obrigatórios.' });

    const book = new Book({ title, subject, characterName, nodes, authorId: req.user.userId });
    await book.save();
    res.status(201).json({ message: 'Livro publicado com sucesso!', book });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao publicar o livro.' });
  }
});

// GET /api/books — lista todos (leitores e escritores)
router.get('/', auth, async (req, res) => {
  try {
    const books = await Book.find().select('title subject characterName authorId createdAt');
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar livros.' });
  }
});

// GET /api/books/mine — livros do escritor logado
router.get('/mine', auth, async (req, res) => {
  try {
    if (req.user.role !== 'escritor')
      return res.status(403).json({ message: 'Apenas escritores têm painel de autoria.' });

    const books = await Book.find({ authorId: req.user.userId });
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar seus livros.' });
  }
});

// GET /api/books/:id — detalhe de um livro
router.get('/:id', auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Livro não encontrado.' });
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar o livro.' });
  }
});

// PUT /api/books/:id — editar livro (só o autor)
router.put('/:id', auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Livro não encontrado.' });

    if (book.authorId.toString() !== req.user.userId)
      return res.status(403).json({ message: 'Você não tem permissão para editar este livro.' });

    const { title, subject, characterName, nodes } = req.body;
    if (title) book.title = title;
    if (subject) book.subject = subject;
    if (characterName) book.characterName = characterName;
    if (nodes) book.nodes = nodes;

    await book.save();
    res.json({ message: 'Livro atualizado com sucesso!', book });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao atualizar o livro.' });
  }
});

// DELETE /api/books/:id — excluir livro (só o autor)
router.delete('/:id', auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Livro não encontrado.' });

    if (book.authorId.toString() !== req.user.userId)
      return res.status(403).json({ message: 'Você não tem permissão para excluir este livro.' });

    await book.deleteOne();
    res.json({ message: 'Livro excluído com sucesso.' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao excluir o livro.' });
  }
});

module.exports = router;
