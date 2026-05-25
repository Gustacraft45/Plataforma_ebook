const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true // O nome é obrigatório
  },
  email: {
    type: String,
    required: true,
    unique: true // Não deixa cadastrar dois usuários com o mesmo e-mail
  },
  password: {
    type: String,
    required: true
  },
  xp: {
    type: Number,
    default: 0 // Todo aluno começa com 0 de XP
  },
  progress: [
    {
      bookId: String, // ID do livro que ele está lendo
      currentNode: String // O nó/página onde ele parou
    }
  ]
}, { timestamps: true }); // Cria automaticamente a data de criação e atualização do cadastro

module.exports = mongoose.model('User', UserSchema);