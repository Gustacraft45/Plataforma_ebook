// seed.js — rode com: node seed.js
// Coloque este arquivo na raiz do backend

require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('./models/Book');
const User = require('./models/User');
const bookData = require('./ebook_programacao.json'); // coloque o JSON na raiz do backend

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado ao MongoDB');

    // Busca o primeiro usuário com role 'escritor' para ser o autor
    const autor = await User.findOne({ role: 'escritor' });
    if (!autor) {
      console.error('❌ Nenhum usuário com role "escritor" encontrado.');
      console.error('   Crie uma conta de escritor na plataforma primeiro.');
      process.exit(1);
    }

    console.log(`📖 Autor encontrado: ${autor.name}`);

    // Verifica se o livro já foi importado
    const existente = await Book.findOne({ title: bookData.title });
    if (existente) {
      console.log('⚠️  Livro já existe no banco. Pulando importação.');
      process.exit(0);
    }

    const livro = new Book({
      title:         bookData.title,
      subject:       bookData.subject,
      characterName: bookData.characterName,
      authorId:      autor._id,
      nodes:         bookData.nodes,
    });

    await livro.save();
    console.log(`✅ Livro importado com sucesso!`);
    console.log(`   Título:  ${livro.title}`);
    console.log(`   Cenas:   ${livro.nodes.length}`);
    console.log(`   ID:      ${livro._id}`);

  } catch (err) {
    console.error('❌ Erro:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado.');
  }
}

seed();
