import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const [books, setBooks] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/books', {
          headers: { 
            // Passa o Token JWT salvo no login para o porteiro do backend liberar o acesso
            'Authorization': `Bearer ${localStorage.getItem('token')}` 
          }
        })
        if (response.ok) {
          const data = await response.json()
          setBooks(data)
        } else {
          navigate('/') // Se o token for inválido, chuta o cara de volta pro login
        }
      } catch (error) {
        console.error("Erro ao buscar livros", error)
      }
    }
    fetchBooks()
  }, [navigate])

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', backgroundColor: '#f3f4f6', minHeight: '100vh' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ color: '#1f2937' }}>📚 Seus E-books Disponíveis</h2>
        <p style={{ color: '#6b7280', marginBottom: '30px' }}>Escolha um tema abaixo para iniciar sua jornada de aprendizado interativo.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {books.map((book) => (
            <div key={book._id} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'between' }}>
              <div>
                <span style={{ fontSize: '12px', backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '4px 8px', borderRadius: '12px', fontWeight: 'bold' }}>{book.subject}</span>
                <h3 style={{ marginTop: '12px', color: '#1f2937' }}>{book.title}</h3>
                <p style={{ color: '#4b5563', fontSize: '14px', lineHeight: '1.5' }}>{book.description}</p>
                <p style={{ fontSize: '13px', color: '#9ca3af' }}>Mentor: 🤖 {book.characterName}</p>
              </div>
              <button 
                onClick={() => navigate(`/book/${book._id}`)}
                style={{ marginTop: '20px', padding: '10px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Iniciar Leitura
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}