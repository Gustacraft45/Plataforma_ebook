import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from './api'

const SUBJECT_COLORS = {
  'Programação': '#6366f1', 'Matemática': '#f59e0b', 'Física': '#10b981',
  'História': '#ef4444', 'Biologia': '#84cc16', 'Química': '#8b5cf6',
}
const subjectColor = (s) => SUBJECT_COLORS[s] || '#6366f1'

// Skeleton de um card
function SkeletonCard() {
  return (
    <div style={{
      background: '#13151c', border: '1px solid #1e2030',
      borderRadius: 16, padding: 28, display: 'flex', flexDirection: 'column', gap: 14
    }}>
      {[60, 140, 90, 40].map((w, i) => (
        <div key={i} style={{
          height: i === 1 ? 22 : 14, width: w, borderRadius: 6,
          background: 'linear-gradient(90deg, #1e2030 25%, #262840 50%, #1e2030 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.4s infinite',
          animationDelay: `${i * 0.1}s`
        }} />
      ))}
    </div>
  )
}

export default function Dashboard() {
  const [books, setBooks] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleUnauth = useCallback(() => {
    localStorage.clear()
    navigate('/')
  }, [navigate])

  useEffect(() => {
    const load = async () => {
      const [booksRes, userRes] = await Promise.all([api.books.list(), api.user.me()])

      // Token expirado ou inválido
      if (!booksRes.ok) {
        if (booksRes.data?.message?.includes('Token') || booksRes.data?.status === 401) {
          handleUnauth(); return
        }
        setError('Não foi possível carregar os livros.')
        setLoading(false); return
      }

      setBooks(booksRes.data)
      if (userRes.ok) setUser(userRes.data)
      setLoading(false)
    }
    load()
  }, [handleUnauth])

  const logout = () => { localStorage.clear(); navigate('/') }

  const xpLevel = user ? Math.floor(user.xp / 100) + 1 : 1
  const xpProgress = user ? (user.xp % 100) : 0

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }

        * { box-sizing: border-box; }
        .dash-root { min-height: 100vh; background: #0d0f14; font-family: 'DM Sans', sans-serif; color: #c9c8d6; }

        .dash-nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 40px; border-bottom: 1px solid #1e2030;
          position: sticky; top: 0; background: rgba(13,15,20,0.9);
          backdrop-filter: blur(12px); z-index: 10;
        }
        .dash-brand { font-family: 'Lora', serif; font-size: 18px; color: #f1f0ff; display: flex; align-items: center; gap: 10px; }
        .dash-brand span { font-size: 20px; }
        .dash-nav-right { display: flex; align-items: center; gap: 12px; }

        .dash-user-pill {
          display: flex; align-items: center; gap: 10px;
          background: #13151c; border: 1px solid #2a2d3a;
          padding: 7px 14px; border-radius: 20px;
        }
        .dash-avatar {
          width: 26px; height: 26px; border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; color: white; font-weight: 500; flex-shrink: 0;
        }
        .dash-user-info { display: flex; flex-direction: column; gap: 1px; }
        .dash-user-name { font-size: 12px; color: #f1f0ff; font-weight: 500; line-height: 1; }
        .dash-user-level { font-size: 10px; color: #6366f1; line-height: 1; }

        .dash-xp-mini { display: flex; align-items: center; gap: 8px; }
        .dash-xp-track { width: 60px; height: 3px; background: #1e2030; border-radius: 2px; }
        .dash-xp-fill { height: 100%; background: linear-gradient(90deg, #6366f1, #a78bfa); border-radius: 2px; transition: width 0.6s; }
        .dash-xp-num { font-size: 11px; color: #a78bfa; }

        .dash-logout {
          background: none; border: 1px solid #2a2d3a; color: #4a4d60;
          font-size: 12px; padding: 7px 12px; border-radius: 8px;
          cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s;
        }
        .dash-logout:hover { border-color: #4a4d60; color: #c9c8d6; }

        .dash-body { max-width: 960px; margin: 0 auto; padding: 56px 40px; }

        .dash-hero { margin-bottom: 52px; animation: fadeUp 0.4s ease both; }
        .dash-hero-greeting { font-size: 13px; color: #4a4d60; margin-bottom: 8px; letter-spacing: 0.04em; }
        .dash-hero h2 {
          font-family: 'Lora', serif; font-size: 34px; font-weight: 600;
          color: #f1f0ff; margin: 0 0 10px; line-height: 1.2;
        }
        .dash-hero p { font-size: 15px; color: #666980; margin: 0; }

        .dash-stats { display: flex; gap: 12px; margin-bottom: 52px; animation: fadeUp 0.4s 0.1s ease both; }
        .dash-stat {
          background: #13151c; border: 1px solid #1e2030;
          border-radius: 14px; padding: 18px 22px; flex: 1;
        }
        .dash-stat-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #4a4d60; margin-bottom: 8px; }
        .dash-stat-value { font-family: 'Lora', serif; font-size: 26px; color: #f1f0ff; }
        .dash-stat-sub { font-size: 12px; color: #6366f1; margin-top: 2px; }

        .dash-section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px; }
        .dash-section-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #4a4d60; font-weight: 500; }
        .dash-count { font-size: 12px; color: #4a4d60; }

        .dash-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 18px; }

        .book-card {
          background: #13151c; border: 1px solid #1e2030;
          border-radius: 16px; padding: 26px;
          display: flex; flex-direction: column; gap: 12px;
          transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
          cursor: pointer; animation: fadeUp 0.4s ease both;
        }
        .book-card:hover {
          border-color: #3a3d55; transform: translateY(-3px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.3);
        }
        .book-subject {
          font-size: 10px; font-weight: 500; text-transform: uppercase;
          letter-spacing: 0.08em; padding: 4px 10px; border-radius: 20px;
          display: inline-block; width: fit-content;
        }
        .book-title {
          font-family: 'Lora', serif; font-size: 17px;
          color: #f1f0ff; line-height: 1.4; margin: 0; flex: 1;
        }
        .book-meta { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #4a4d60; }
        .book-btn {
          margin-top: 4px; padding: 10px 16px; border: none;
          border-radius: 10px; font-size: 13px; font-weight: 500;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: opacity 0.2s; width: 100%; text-align: center;
        }

        .dash-empty {
          grid-column: 1/-1; text-align: center;
          padding: 80px 0; border: 1px dashed #1e2030;
          border-radius: 16px;
        }
        .dash-empty-icon { font-size: 40px; margin-bottom: 16px; }
        .dash-empty p { font-size: 15px; color: #4a4d60; margin: 0 0 6px; }
        .dash-empty small { font-size: 13px; color: #2a2d3a; }

        .dash-error {
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
          border-radius: 12px; padding: 20px; text-align: center;
          color: #f87171; font-size: 14px;
        }
      `}</style>

      <div className="dash-root">
        <nav className="dash-nav">
          <div className="dash-brand"><span>📖</span> Arcano Saber</div>
          <div className="dash-nav-right">
            {user && (
              <div className="dash-user-pill">
                <div className="dash-avatar">{user.name?.[0]?.toUpperCase()}</div>
                <div className="dash-user-info">
                  <div className="dash-user-name">{user.name.split(' ')[0]}</div>
                  <div className="dash-user-level">Nível {xpLevel}</div>
                </div>
                <div className="dash-xp-mini">
                  <div className="dash-xp-track">
                    <div className="dash-xp-fill" style={{ width: `${xpProgress}%` }} />
                  </div>
                  <span className="dash-xp-num">{user.xp} XP</span>
                </div>
              </div>
            )}
            <button className="dash-logout" onClick={logout}>Sair</button>
          </div>
        </nav>

        <div className="dash-body">
          <div className="dash-hero">
            <p className="dash-hero-greeting">Bem-vindo de volta</p>
            <h2>{user ? `${user.name.split(' ')[0]}, pronto para aprender?` : 'Sua jornada continua.'}</h2>
            <p>Escolha um livro abaixo e continue sua aventura de conhecimento.</p>
          </div>

          {user && (
            <div className="dash-stats" style={{ animationDelay: '0.1s' }}>
              <div className="dash-stat">
                <div className="dash-stat-label">XP Total</div>
                <div className="dash-stat-value">{user.xp}</div>
                <div className="dash-stat-sub">Nível {xpLevel}</div>
              </div>
              <div className="dash-stat">
                <div className="dash-stat-label">Livros iniciados</div>
                <div className="dash-stat-value">{user.progress?.length || 0}</div>
                <div className="dash-stat-sub">de {books.length} disponíveis</div>
              </div>
              <div className="dash-stat">
                <div className="dash-stat-label">Próximo nível em</div>
                <div className="dash-stat-value">{100 - xpProgress}</div>
                <div className="dash-stat-sub">pontos de XP</div>
              </div>
            </div>
          )}

          <div className="dash-section-header">
            <div className="dash-section-label">Biblioteca</div>
            {!loading && <div className="dash-count">{books.length} título{books.length !== 1 ? 's' : ''}</div>}
          </div>

          {error && <div className="dash-error">{error}</div>}

          <div className="dash-grid">
            {loading
              ? [1, 2, 3].map(i => <SkeletonCard key={i} />)
              : books.length === 0
              ? (
                <div className="dash-empty">
                  <div className="dash-empty-icon">📭</div>
                  <p>Nenhum livro disponível ainda.</p>
                  <small>Novos títulos aparecerão aqui quando forem publicados.</small>
                </div>
              )
              : books.map((book, i) => {
                const color = subjectColor(book.subject)
                const userProgress = user?.progress?.find(p => p.bookId?.toString() === book._id)
                return (
                  <div
                    key={book._id}
                    className="book-card"
                    style={{ animationDelay: `${0.2 + i * 0.07}s` }}
                    onClick={() => navigate(`/book/${book._id}`)}
                  >
                    <span className="book-subject" style={{ background: `${color}18`, color }}>{book.subject}</span>
                    <h3 className="book-title">{book.title}</h3>
                    <div className="book-meta">
                      <span>🧙</span>
                      <span>{book.characterName}</span>
                      {userProgress && <span style={{ marginLeft: 'auto', color: '#10b981' }}>● Em andamento</span>}
                    </div>
                    <button
                      className="book-btn"
                      style={{ background: `${color}18`, color }}
                      onClick={e => { e.stopPropagation(); navigate(`/book/${book._id}`) }}
                    >
                      {userProgress ? 'Continuar jornada →' : 'Iniciar jornada →'}
                    </button>
                  </div>
                )
              })
            }
          </div>
        </div>
      </div>
    </>
  )
}
