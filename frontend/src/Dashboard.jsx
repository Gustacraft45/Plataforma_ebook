import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from './api'

const SUBJECT_COLORS = {
  'Programação': '#6366f1', 'Matemática': '#f59e0b', 'Física': '#10b981',
  'História': '#ef4444', 'Biologia': '#84cc16', 'Química': '#8b5cf6',
}
const subjectColor = (s) => SUBJECT_COLORS[s] || '#6366f1'

export default function Dashboard() {
  const [books, setBooks] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      const [booksRes, userRes] = await Promise.all([api.books.list(), api.user.me()])
      if (!booksRes.ok) { navigate('/'); return }
      setBooks(booksRes.data)
      if (userRes.ok) setUser(userRes.data)
      setLoading(false)
    }
    load()
  }, [navigate])

  const logout = () => { localStorage.clear(); navigate('/') }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0d0f14', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666980', fontFamily: 'DM Sans, sans-serif' }}>
      Carregando sua estante...
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        .dash-root { min-height: 100vh; background: #0d0f14; font-family: 'DM Sans', sans-serif; color: #c9c8d6; }
        .dash-nav { display: flex; align-items: center; justify-content: space-between; padding: 20px 40px; border-bottom: 1px solid #1e2030; }
        .dash-nav-brand { font-family: 'Lora', serif; font-size: 18px; color: #f1f0ff; display: flex; align-items: center; gap: 10px; }
        .dash-nav-right { display: flex; align-items: center; gap: 16px; }
        .dash-xp { display: flex; align-items: center; gap: 8px; background: #1a1c28; border: 1px solid #2a2d3a; padding: 6px 14px; border-radius: 20px; font-size: 13px; color: #a78bfa; }
        .dash-logout { background: none; border: 1px solid #2a2d3a; color: #666980; font-size: 13px; padding: 6px 14px; border-radius: 8px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
        .dash-logout:hover { border-color: #4a4d60; color: #c9c8d6; }
        .dash-body { max-width: 900px; margin: 0 auto; padding: 50px 40px; }
        .dash-hero { margin-bottom: 48px; }
        .dash-hero h2 { font-family: 'Lora', serif; font-size: 32px; font-weight: 600; color: #f1f0ff; margin: 0 0 8px; }
        .dash-hero p { font-size: 15px; color: #666980; margin: 0; }
        .dash-section-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #4a4d60; font-weight: 500; margin-bottom: 20px; }
        .dash-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px; }
        .book-card { background: #13151c; border: 1px solid #1e2030; border-radius: 16px; padding: 28px; display: flex; flex-direction: column; gap: 14px; transition: border-color 0.2s, transform 0.2s; cursor: pointer; }
        .book-card:hover { border-color: #3a3d55; transform: translateY(-2px); }
        .book-subject { font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.08em; padding: 4px 10px; border-radius: 20px; display: inline-block; }
        .book-title { font-family: 'Lora', serif; font-size: 17px; color: #f1f0ff; line-height: 1.4; margin: 0; }
        .book-character { font-size: 12px; color: #4a4d60; font-style: italic; }
        .book-btn { margin-top: auto; padding: 10px 16px; border: none; border-radius: 10px; font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: opacity 0.2s; }
        .dash-empty { text-align: center; padding: 80px 0; color: #4a4d60; }
        .dash-empty p { font-size: 15px; margin: 0; }
      `}</style>

      <div className="dash-root">
        <nav className="dash-nav">
          <div className="dash-nav-brand">📖 Arcano Saber</div>
          <div className="dash-nav-right">
            {user && <div className="dash-xp">⚡ {user.xp} XP</div>}
            <button className="dash-logout" onClick={logout}>Sair</button>
          </div>
        </nav>

        <div className="dash-body">
          <div className="dash-hero">
            <h2>Olá, {user?.name?.split(' ')[0] || 'Aprendiz'} 👋</h2>
            <p>Escolha um livro abaixo para continuar sua jornada de aprendizado.</p>
          </div>

          <div className="dash-section-label">Livros disponíveis — {books.length} título{books.length !== 1 ? 's' : ''}</div>

          {books.length === 0 ? (
            <div className="dash-empty"><p>Nenhum livro cadastrado ainda.</p></div>
          ) : (
            <div className="dash-grid">
              {books.map(book => {
                const color = subjectColor(book.subject)
                return (
                  <div key={book._id} className="book-card" onClick={() => navigate(`/book/${book._id}`)}>
                    <span className="book-subject" style={{ background: `${color}18`, color }}>{book.subject}</span>
                    <h3 className="book-title">{book.title}</h3>
                    <p className="book-character">Mentor: {book.characterName}</p>
                    <button className="book-btn" style={{ background: `${color}20`, color }}>
                      Iniciar jornada →
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
