import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './Login'
import Dashboard from './Dashboard'
import BookReading from './BookReading'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota raiz: Abre a tela de Login */}
        <Route path="/" element={<Login />} />
        
        {/* Rota da estante de livros */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Rota dinamica da leitura. O ":id" muda para cada livro do banco */}
        <Route path="/book/:id" element={<BookReading />} />
      </Routes>
    </BrowserRouter>
  )
}