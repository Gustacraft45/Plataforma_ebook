import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from './api'

const SUBJECT_COLORS = {
  'Programação': '#3b82f6','Matemática': '#f59e0b','Física': '#10b981',
  'História': '#ef4444','Biologia': '#84cc16','Química': '#8b5cf6',
  'Literatura': '#ec4899','Filosofia': '#06b6d4','Outros': '#6b7280',
}
const col = s => SUBJECT_COLORS[s] || '#3b82f6'

function SkeletonCard() {
  return (
    <div style={{ background:'#111113', border:'1px solid #1c1c1e', borderRadius:16, padding:24, display:'flex', flexDirection:'column', gap:14 }}>
      {[50,140,90,36].map((w,i) => (
        <div key={i} style={{ height:i===1?18:12, width:w, borderRadius:4, background:'linear-gradient(90deg,#1c1c1e 25%,#27272a 50%,#1c1c1e 75%)', backgroundSize:'200% 100%', animation:`sk 1.4s ${i*.1}s infinite` }} />
      ))}
    </div>
  )
}

function StatBlock({ label, value, sub, mono }) {
  return (
    <div style={{ padding:'22px 24px', borderRight:'1px solid #1c1c1e', flex:1, minWidth:0 }}>
      <div style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'.08em', color:'#52525b', marginBottom:10, fontWeight:500 }}>{label}</div>
      <div style={{ fontFamily: mono ? "'Geist Mono',monospace" : "'Outfit',sans-serif", fontSize:28, fontWeight:600, color:'#fafafa', letterSpacing:'-.02em', lineHeight:1 }}>{value}</div>
      {sub && <div style={{ fontSize:12, color:'#3f3f46', marginTop:6 }}>{sub}</div>}
    </div>
  )
}

export default function Dashboard() {
  const [books, setBooks] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('library')
  const [exportLoading, setExportLoading] = useState(false)
  const navigate = useNavigate()

  const handleUnauth = useCallback(() => { localStorage.clear(); navigate('/') }, [navigate])

  useEffect(() => {
    const load = async () => {
      const [br, ur, ar] = await Promise.all([api.books.list(), api.user.me(), api.user.analytics()])
      if (!br.ok) { handleUnauth(); return }
      setBooks(br.data)
      if (ur.ok) setUser(ur.data)
      if (ar.ok) setAnalytics(ar.data)
      setLoading(false)
    }
    load()
  }, [handleUnauth])

  const exportJson = async () => {
    setExportLoading(true)
    const { ok, data } = await api.user.report()
    if (ok) {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `arcano_saber_report_${new Date().toISOString().split('T')[0]}.json`
      a.click()
    }
    setExportLoading(false)
  }

  const level = analytics ? analytics.nivel : 1
  const xpProgress = analytics ? analytics.xp % 100 : 0

  const sessaoData = analytics?.sessoes?.slice(-7) || []
  const maxMin = Math.max(...sessaoData.map(s => s.minutesRead), 1)
  const materiaData = Object.entries(analytics?.distribuicaoMaterias || {})

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&family=Geist+Mono:wght@400;500&display=swap');
        @keyframes sk{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .d-root { min-height:100dvh; background:#09090b; font-family:'Outfit',sans-serif; color:#a1a1aa; }

        /* NAV */
        .d-nav { display:flex; align-items:center; justify-content:space-between; padding:0 40px; height:56px; border-bottom:1px solid #1c1c1e; position:sticky; top:0; background:rgba(9,9,11,.9); backdrop-filter:blur(16px); z-index:20; }
        .d-nav-brand { display:flex; align-items:center; gap:10px; }
        .d-nav-icon { width:30px; height:30px; border:1px solid #27272a; border-radius:8px; display:flex; align-items:center; justify-content:center; }
        .d-nav-name { font-size:14px; font-weight:600; color:#fafafa; letter-spacing:-.01em; }
        .d-nav-right { display:flex; align-items:center; gap:8px; }
        .d-user { display:flex; align-items:center; gap:10px; padding:6px 12px; border:1px solid #1c1c1e; border-radius:20px; background:#111113; }
        .d-avatar { width:24px; height:24px; border-radius:50%; background:#27272a; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:600; color:#a1a1aa; flex-shrink:0; }
        .d-user-name { font-size:13px; color:#fafafa; font-weight:500; }
        .d-user-lvl { font-size:11px; color:#3f3f46; }
        .d-xp-bar { width:50px; height:2px; background:#1c1c1e; border-radius:1px; }
        .d-xp-fill { height:100%; background:#10b981; border-radius:1px; transition:width .6s; }
        .d-xp-num { font-family:'Geist Mono',monospace; font-size:11px; color:#3f3f46; }
        .d-logout { padding:6px 14px; background:none; border:1px solid #1c1c1e; color:#52525b; font-size:12px; border-radius:8px; cursor:pointer; font-family:'Outfit',sans-serif; transition:all .18s; }
        .d-logout:hover { color:#a1a1aa; border-color:#27272a; }

        /* TABS */
        .d-tabs { display:flex; gap:0; padding:0 40px; border-bottom:1px solid #1c1c1e; }
        .d-tab { padding:14px 4px; margin-right:28px; border:none; background:transparent; font-size:13px; font-weight:500; color:#52525b; cursor:pointer; font-family:'Outfit',sans-serif; border-bottom:1.5px solid transparent; transition:all .18s; margin-bottom:-1px; }
        .d-tab.active { color:#fafafa; border-bottom-color:#fafafa; }

        /* BODY */
        .d-body { max-width:1100px; margin:0 auto; padding:52px 40px 100px; }

        /* STATS ROW */
        .d-stats-row { display:flex; border:1px solid #1c1c1e; border-radius:14px; overflow:hidden; margin-bottom:40px; }
        .d-stats-row > div:last-child { border-right:none; }

        /* SECTION */
        .d-section-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; }
        .d-section-label { font-size:11px; text-transform:uppercase; letter-spacing:.1em; color:#3f3f46; font-weight:500; }
        .d-count { font-size:12px; color:#3f3f46; }

        /* BOOK GRID */
        .d-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(290px,1fr)); gap:1px; background:#1c1c1e; border:1px solid #1c1c1e; border-radius:16px; overflow:hidden; }
        .d-book { background:#09090b; padding:28px; display:flex; flex-direction:column; gap:14px; cursor:pointer; transition:background .18s; animation:fadeUp .35s ease both; }
        .d-book:hover { background:#111113; }
        .d-subj { font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:.08em; display:inline-flex; align-items:center; gap:5px; }
        .d-subj-dot { width:5px; height:5px; border-radius:50%; flex-shrink:0; }
        .d-book-title { font-size:16px; font-weight:500; color:#fafafa; line-height:1.4; letter-spacing:-.01em; flex:1; }
        .d-book-meta { display:flex; align-items:center; gap:6px; font-size:12px; color:#3f3f46; }
        .d-book-btn { padding:9px 14px; border:1px solid #1c1c1e; border-radius:8px; background:transparent; font-size:12px; font-weight:500; cursor:pointer; font-family:'Outfit',sans-serif; transition:all .18s; color:#a1a1aa; text-align:center; }
        .d-book-btn:hover { background:#1c1c1e; color:#fafafa; }
        .d-book-progbar { height:2px; background:#1c1c1e; border-radius:1px; }
        .d-book-progfill { height:100%; border-radius:1px; transition:width .5s; }

        /* CHARTS */
        .d-charts { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px; }
        .d-chart-card { border:1px solid #1c1c1e; border-radius:14px; padding:24px; }
        .d-chart-title { font-size:11px; text-transform:uppercase; letter-spacing:.08em; color:#3f3f46; font-weight:500; margin-bottom:20px; }
        .d-bar-row { display:flex; align-items:flex-end; gap:6px; height:72px; }
        .d-bar-col { flex:1; display:flex; flex-direction:column; align-items:center; gap:4px; }
        .d-bar { width:100%; border-radius:3px 3px 0 0; transition:height .4s; min-height:3px; }
        .d-bar-lbl { font-size:9px; color:#3f3f46; }
        .d-materia-row { display:flex; flex-direction:column; gap:10px; }
        .d-materia-item { display:flex; align-items:center; gap:10px; }
        .d-materia-label { font-size:12px; color:#71717a; min-width:90px; }
        .d-materia-track { flex:1; height:3px; background:#1c1c1e; border-radius:2px; }
        .d-materia-fill { height:100%; border-radius:2px; }
        .d-materia-val { font-family:'Geist Mono',monospace; font-size:11px; color:#52525b; min-width:18px; text-align:right; }

        /* PROGRESS TABLE */
        .d-prog-card { border:1px solid #1c1c1e; border-radius:14px; overflow:hidden; margin-bottom:16px; }
        .d-prog-row { display:flex; align-items:center; justify-content:space-between; padding:16px 22px; border-bottom:1px solid #1c1c1e; gap:20px; }
        .d-prog-row:last-child { border-bottom:none; }
        .d-prog-title { font-size:13px; color:#fafafa; font-weight:500; }
        .d-prog-sub { font-size:11px; color:#3f3f46; margin-top:2px; }
        .d-prog-pct { font-family:'Geist Mono',monospace; font-size:13px; color:#a1a1aa; white-space:nowrap; }

        /* EXPORT */
        .d-export { padding:8px 16px; background:transparent; border:1px solid #1c1c1e; color:#52525b; font-size:12px; font-weight:500; border-radius:8px; cursor:pointer; font-family:'Outfit',sans-serif; transition:all .18s; }
        .d-export:hover { border-color:#27272a; color:#a1a1aa; }

        /* EMPTY */
        .d-empty { grid-column:1/-1; padding:80px 0; text-align:center; }
        .d-empty-title { font-size:15px; color:#3f3f46; margin-top:12px; }
        .d-empty-sub { font-size:13px; color:#27272a; margin-top:4px; }

        @media(max-width:767px){
          .d-nav{padding:0 20px;}
          .d-tabs{padding:0 20px;}
          .d-body{padding:32px 20px 80px;}
          .d-stats-row{flex-direction:column;}
          .d-stats-row>div{border-right:none;border-bottom:1px solid #1c1c1e;}
          .d-stats-row>div:last-child{border-bottom:none;}
          .d-charts{grid-template-columns:1fr;}
        }
      `}</style>

      <div className="d-root">
        <nav className="d-nav">
          <div className="d-nav-brand">
            <div className="d-nav-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 3h12M2 7h7M2 11h9" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="d-nav-name">Arcano Saber</span>
          </div>
          <div className="d-nav-right">
            {user && (
              <div className="d-user">
                <div className="d-avatar">{user.name?.[0]?.toUpperCase()}</div>
                <div>
                  <div className="d-user-name">{user.name.split(' ')[0]}</div>
                  <div className="d-user-lvl">Nível {level}</div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <div className="d-xp-bar"><div className="d-xp-fill" style={{ width:`${xpProgress}%` }} /></div>
                  <span className="d-xp-num">{analytics?.xp || 0}</span>
                </div>
              </div>
            )}
            <button className="d-logout" onClick={() => { localStorage.clear(); navigate('/') }}>Sair</button>
          </div>
        </nav>

        <div className="d-tabs">
          <button className={`d-tab ${tab==='library'?'active':''}`} onClick={() => setTab('library')}>Biblioteca</button>
          <button className={`d-tab ${tab==='panel'?'active':''}`} onClick={() => setTab('panel')}>Painel</button>
        </div>

        <div className="d-body">

          {/* ── BIBLIOTECA ── */}
          {tab === 'library' && (
            <>
              {!loading && analytics && (
                <div className="d-stats-row" style={{ marginBottom:40 }}>
                  <StatBlock label="XP total" value={analytics.xp} sub={`Nível ${level}`} mono />
                  <StatBlock label="Taxa de acerto" value={`${analytics.taxaAcerto}%`} sub={`${analytics.totalRespostas} respostas`} mono />
                  <StatBlock label="Aprendizado" value={`${analytics.taxaAprendizado}%`} sub="correto + parcial" mono />
                  <StatBlock label="Livros" value={analytics.livrosIniciados} sub={`de ${books.length} disponíveis`} mono />
                </div>
              )}

              <div className="d-section-head">
                <span className="d-section-label">Todos os livros</span>
                {!loading && <span className="d-count">{books.length} título{books.length!==1?'s':''}</span>}
              </div>

              <div className="d-grid">
                {loading ? [1,2,3].map(i => <SkeletonCard key={i} />) :
                  books.length === 0 ? (
                    <div className="d-empty">
                      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" style={{ margin:'0 auto', display:'block' }}>
                        <rect x="6" y="6" width="24" height="24" rx="4" stroke="#27272a" strokeWidth="1.5"/>
                        <path d="M12 13h12M12 18h8M12 23h10" stroke="#27272a" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      <div className="d-empty-title">Nenhum livro disponível.</div>
                      <div className="d-empty-sub">Novos títulos aparecerão aqui.</div>
                    </div>
                  ) : books.map((book, i) => {
                    const c = col(book.subject)
                    const prog = analytics?.progressoLivros?.find(p => p.bookId?.toString() === book._id)
                    return (
                      <div key={book._id} className="d-book" style={{ animationDelay:`${i*.06}s` }} onClick={() => navigate(`/book/${book._id}`)}>
                        <div className="d-subj" style={{ color:c }}>
                          <div className="d-subj-dot" style={{ background:c }} />
                          {book.subject}
                        </div>
                        <div className="d-book-title">{book.title}</div>
                        <div className="d-book-meta">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2" stroke="#3f3f46" strokeWidth="1.2"/><path d="M2 10c0-2 1.8-3.5 4-3.5s4 1.5 4 3.5" stroke="#3f3f46" strokeWidth="1.2" strokeLinecap="round"/></svg>
                          {book.characterName}
                          {prog && <span style={{ marginLeft:'auto', fontSize:11, color:'#10b981', display:'flex', alignItems:'center', gap:4 }}><span style={{ width:4, height:4, borderRadius:'50%', background:'#10b981', display:'inline-block' }}/>Em andamento</span>}
                        </div>
                        {prog && (
                          <div>
                            <div className="d-book-progbar"><div className="d-book-progfill" style={{ width:`${prog.percentual}%`, background:c }} /></div>
                            <div style={{ fontSize:10, color:'#3f3f46', marginTop:4, textAlign:'right' }}>{prog.percentual}% concluído</div>
                          </div>
                        )}
                        <button className="d-book-btn" onClick={e => { e.stopPropagation(); navigate(`/book/${book._id}`) }}>
                          {prog ? 'Continuar' : 'Começar'} →
                        </button>
                      </div>
                    )
                  })
                }
              </div>
            </>
          )}

          {/* ── PAINEL ── */}
          {tab === 'panel' && (
            <>
              <div className="d-section-head" style={{ marginBottom:28 }}>
                <span className="d-section-label">Métricas de aprendizado</span>
                <button className="d-export" onClick={exportJson} disabled={exportLoading}>
                  {exportLoading ? 'Gerando...' : 'Exportar JSON'}
                </button>
              </div>

              {!loading && analytics && (
                <>
                  <div className="d-stats-row" style={{ marginBottom:24 }}>
                    <StatBlock label="XP total" value={analytics.xp} sub={`Nível ${level}`} mono />
                    <StatBlock label="Acertos" value={`${analytics.taxaAcerto}%`} sub={`${analytics.totalRespostas} respostas`} mono />
                    <StatBlock label="Aprendizado" value={`${analytics.taxaAprendizado}%`} sub="correto + parcial" mono />
                    <StatBlock label="Livros" value={analytics.livrosIniciados} sub={`de ${books.length} disponíveis`} mono />
                  </div>

                  <div className="d-charts">
                    <div className="d-chart-card">
                      <div className="d-chart-title">Minutos lidos — 7 dias</div>
                      {sessaoData.length > 0 ? (
                        <>
                          <div className="d-bar-row">
                            {sessaoData.map((s, i) => (
                              <div key={i} className="d-bar-col">
                                <div className="d-bar" style={{ height:`${(s.minutesRead/maxMin)*64}px`, background:'#3b82f6' }} />
                                <div className="d-bar-lbl">{s.date.slice(5)}</div>
                              </div>
                            ))}
                          </div>
                          <div style={{ display:'flex', gap:20, marginTop:16 }}>
                            <div>
                              <div style={{ fontSize:10, color:'#3f3f46', marginBottom:4 }}>Média/dia</div>
                              <div style={{ fontFamily:"'Geist Mono',monospace", fontSize:18, color:'#fafafa' }}>{analytics.mediaMinutosDia}<span style={{ fontSize:11, color:'#52525b', marginLeft:3 }}>min</span></div>
                            </div>
                            <div>
                              <div style={{ fontSize:10, color:'#3f3f46', marginBottom:4 }}>Ocioso</div>
                              <div style={{ fontFamily:"'Geist Mono',monospace", fontSize:18, color:'#ef4444' }}>{analytics.totalMinutosOcioso}<span style={{ fontSize:11, color:'#52525b', marginLeft:3 }}>min</span></div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div style={{ color:'#27272a', fontSize:13, paddingTop:16 }}>Sem dados de sessão ainda.</div>
                      )}
                    </div>

                    <div className="d-chart-card">
                      <div className="d-chart-title">Gêneros de interesse</div>
                      {materiaData.length > 0 ? (
                        <div className="d-materia-row">
                          {materiaData.map(([k, v]) => {
                            const max = Math.max(...materiaData.map(([,n]) => n), 1)
                            return (
                              <div key={k} className="d-materia-item">
                                <div className="d-materia-label">{k}</div>
                                <div className="d-materia-track">
                                  <div className="d-materia-fill" style={{ width:`${(v/max)*100}%`, background:col(k) }} />
                                </div>
                                <div className="d-materia-val">{v}</div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div style={{ color:'#27272a', fontSize:13 }}>Inicie um livro para ver seus gêneros.</div>
                      )}
                    </div>
                  </div>

                  {analytics.progressoLivros?.length > 0 && (
                    <>
                      <div className="d-section-head" style={{ marginBottom:12 }}>
                        <span className="d-section-label">Progresso por livro</span>
                      </div>
                      <div className="d-prog-card">
                        {analytics.progressoLivros.map((p, i) => (
                          <div key={i} className="d-prog-row">
                            <div style={{ flex:1, minWidth:0 }}>
                              <div className="d-prog-title">{p.titulo}</div>
                              <div className="d-prog-sub">{p.materia} · {p.cenesCompletas}/{p.totalCenas} cenas</div>
                            </div>
                            <div style={{ width:120, flexShrink:0 }}>
                              <div style={{ height:2, background:'#1c1c1e', borderRadius:1 }}>
                                <div style={{ height:'100%', width:`${p.percentual}%`, background:col(p.materia), borderRadius:1, transition:'width .5s' }} />
                              </div>
                            </div>
                            <div className="d-prog-pct">{p.percentual}%</div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  <div style={{ marginTop:16, padding:'14px 18px', border:'1px solid #1c1c1e', borderRadius:12 }}>
                    <div style={{ fontSize:11, color:'#52525b', fontWeight:500, marginBottom:6, textTransform:'uppercase', letterSpacing:'.06em' }}>Importar no Python</div>
                    <code style={{ fontSize:12, color:'#3f3f46', lineHeight:1.8, display:'block', fontFamily:"'Geist Mono',monospace" }}>
                      import pandas as pd<br/>
                      df = pd.read_json('arcano_saber_report.json')<br/>
                      df.to_excel('relatorio.xlsx', index=False)
                    </code>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
