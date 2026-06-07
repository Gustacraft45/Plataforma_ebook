import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from './api'

const COLORS = { 'Programação':'#6366f1','Matemática':'#f59e0b','Física':'#10b981','História':'#ef4444','Biologia':'#84cc16','Química':'#8b5cf6' }
const col = (s) => COLORS[s] || '#6366f1'

function Skeleton({ w = '100%', h = 14, r = 6, delay = 0 }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: 'linear-gradient(90deg,#1e2030 25%,#262840 50%,#1e2030 75%)', backgroundSize: '200% 100%', animation: `shimmer 1.4s ${delay}s infinite` }} />
}

function StatCard({ label, value, sub, color = '#6366f1' }) {
  return (
    <div style={{ background: '#13151c', border: '1px solid #1e2030', borderRadius: 14, padding: '18px 22px' }}>
      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', color: '#4a4d60', marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: 'Lora,serif', fontSize: 28, color: '#f1f0ff' }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color, marginTop: 3 }}>{sub}</div>}
    </div>
  )
}

function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ width: '100%', background: `${d.color || '#6366f1'}30`, borderRadius: '4px 4px 0 0', height: Math.max((d.value / max) * 64, 4), transition: 'height .4s', position: 'relative' }}>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: d.color || '#6366f1', borderRadius: '4px 4px 0 0', height: '100%' }} />
          </div>
          <div style={{ fontSize: 9, color: '#4a4d60', textAlign: 'center', lineHeight: 1.2 }}>{d.label}</div>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const [books, setBooks] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('biblioteca') // 'biblioteca' | 'painel'
  const [exportLoading, setExportLoading] = useState(false)
  const navigate = useNavigate()

  const logout = () => { localStorage.clear(); navigate('/') }

  const handleUnauth = useCallback(() => { localStorage.clear(); navigate('/') }, [navigate])

  useEffect(() => {
    const load = async () => {
      const [booksRes, userRes, analyticsRes] = await Promise.all([
        api.books.list(), api.user.me(), api.user.analytics()
      ])
      if (!booksRes.ok) { handleUnauth(); return }
      setBooks(booksRes.data)
      if (userRes.ok) setUser(userRes.data)
      if (analyticsRes.ok) setAnalytics(analyticsRes.data)
      setLoading(false)
    }
    load()
  }, [handleUnauth])

  const exportToJson = async () => {
    setExportLoading(true)
    const { ok, data } = await api.user.report()
    if (ok) {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url
      a.download = `relatorio_${user?.name?.replace(/ /g,'_')}_${new Date().toISOString().split('T')[0]}.json`
      a.click(); URL.revokeObjectURL(url)
    }
    setExportLoading(false)
  }

  const xpLevel = analytics ? analytics.nivel : 1
  const xpProgress = analytics ? analytics.xp % 100 : 0

  const sessaoData = analytics?.sessoes?.slice(-7).map(s => ({
    label: s.date.slice(5),
    value: s.minutesRead,
    color: '#6366f1'
  })) || []

  const materiaData = analytics
    ? Object.entries(analytics.distribuicaoMaterias || {}).map(([k, v]) => ({ label: k, value: v, color: col(k) }))
    : []

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
        *{box-sizing:border-box;}
        .dr{min-height:100vh;background:#0d0f14;font-family:'DM Sans',sans-serif;color:#c9c8d6;}
        .dnav{display:flex;align-items:center;justify-content:space-between;padding:16px 40px;border-bottom:1px solid #1e2030;position:sticky;top:0;background:rgba(13,15,20,.92);backdrop-filter:blur(12px);z-index:10;}
        .dnav-brand{font-family:'Lora',serif;font-size:18px;color:#f1f0ff;display:flex;align-items:center;gap:10px;}
        .dnav-right{display:flex;align-items:center;gap:12px;}
        .dpill{display:flex;align-items:center;gap:10px;background:#13151c;border:1px solid #2a2d3a;padding:6px 14px;border-radius:20px;}
        .dav{width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;font-size:11px;color:white;font-weight:500;flex-shrink:0;}
        .dxp-track{width:60px;height:3px;background:#1e2030;border-radius:2px;}
        .dxp-fill{height:100%;background:linear-gradient(90deg,#6366f1,#a78bfa);border-radius:2px;transition:width .6s;}
        .dlout{background:none;border:1px solid #2a2d3a;color:#4a4d60;font-size:12px;padding:7px 12px;border-radius:8px;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .2s;}
        .dlout:hover{border-color:#4a4d60;color:#c9c8d6;}
        .dtabs{display:flex;gap:0;padding:0 40px;border-bottom:1px solid #1e2030;background:#0d0f14;}
        .dtab{padding:14px 20px;border:none;background:transparent;color:#4a4d60;font-size:13px;font-weight:500;cursor:pointer;font-family:'DM Sans',sans-serif;border-bottom:2px solid transparent;transition:all .2s;margin-bottom:-1px;}
        .dtab.active{color:#a5b4fc;border-bottom-color:#6366f1;}
        .dbody{max-width:960px;margin:0 auto;padding:48px 40px 80px;}
        .dgrid2{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;}
        .dgrid4{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:28px;}
        .dcard{background:#13151c;border:1px solid #1e2030;border-radius:14px;padding:22px;}
        .dcard-title{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#4a4d60;margin-bottom:14px;font-weight:500;}
        .bk-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:18px;}
        .bk-card{background:#13151c;border:1px solid #1e2030;border-radius:16px;padding:26px;display:flex;flex-direction:column;gap:12px;cursor:pointer;transition:border-color .2s,transform .2s;animation:fadeUp .4s ease both;}
        .bk-card:hover{border-color:#3a3d55;transform:translateY(-2px);}
        .bk-subj{font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.08em;padding:3px 10px;border-radius:20px;display:inline-block;width:fit-content;}
        .bk-title{font-family:'Lora',serif;font-size:17px;color:#f1f0ff;line-height:1.4;margin:0;flex:1;}
        .bk-btn{padding:10px;border:none;border-radius:10px;font-size:13px;font-weight:500;cursor:pointer;font-family:'DM Sans',sans-serif;width:100%;text-align:center;transition:opacity .2s;}
        .bk-btn:hover{opacity:.85;}
        .prog-bar-track{height:4px;background:#1e2030;border-radius:2px;margin-top:6px;}
        .prog-bar-fill{height:100%;border-radius:2px;transition:width .5s;}
        .export-btn{padding:9px 18px;background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.3);color:#6ee7b7;font-size:12px;font-weight:500;border-radius:8px;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .2s;white-space:nowrap;}
        .export-btn:hover{background:rgba(16,185,129,.2);}
        .section-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;}
        .section-label{font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:#4a4d60;font-weight:500;}
        .ring-wrap{display:flex;align-items:center;justify-content:center;gap:24px;}
        .ring-item{text-align:center;}
        .ring-val{font-family:'Lora',serif;font-size:28px;color:#f1f0ff;}
        .ring-lbl{font-size:11px;color:#4a4d60;margin-top:3px;}
        .ring-sub{font-size:12px;margin-top:2px;}
        .empty{text-align:center;padding:60px 0;color:#4a4d60;border:1px dashed #1e2030;border-radius:16px;}
      `}</style>
      <div className="dr">
        <nav className="dnav">
          <div className="dnav-brand">📖 Arcano Saber</div>
          <div className="dnav-right">
            {user && (
              <div className="dpill">
                <div className="dav">{user.name?.[0]?.toUpperCase()}</div>
                <div>
                  <div style={{ fontSize: 12, color: '#f1f0ff', fontWeight: 500 }}>{user.name.split(' ')[0]}</div>
                  <div style={{ fontSize: 10, color: '#6366f1' }}>Nível {xpLevel}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div className="dxp-track"><div className="dxp-fill" style={{ width: `${xpProgress}%` }} /></div>
                  <span style={{ fontSize: 11, color: '#a78bfa' }}>{analytics?.xp || 0} XP</span>
                </div>
              </div>
            )}
            <button className="dlout" onClick={logout}>Sair</button>
          </div>
        </nav>

        <div className="dtabs">
          <button className={`dtab ${tab === 'biblioteca' ? 'active' : ''}`} onClick={() => setTab('biblioteca')}>📚 Biblioteca</button>
          <button className={`dtab ${tab === 'painel' ? 'active' : ''}`} onClick={() => setTab('painel')}>📊 Meu Painel</button>
        </div>

        <div className="dbody">
          {/* ── BIBLIOTECA ── */}
          {tab === 'biblioteca' && (
            <>
              <div className="section-header" style={{ marginBottom: 28 }}>
                <div>
                  <div style={{ fontSize: 13, color: '#4a4d60', marginBottom: 6 }}>Bem-vindo de volta</div>
                  <h2 style={{ fontFamily: 'Lora,serif', fontSize: 28, color: '#f1f0ff', margin: 0 }}>
                    {user ? `${user.name.split(' ')[0]}, pronto para aprender?` : 'Sua jornada continua.'}
                  </h2>
                </div>
              </div>
              <div className="section-header">
                <div className="section-label">Todos os livros</div>
                {!loading && <span style={{ fontSize: 12, color: '#4a4d60' }}>{books.length} título{books.length !== 1 ? 's' : ''}</span>}
              </div>
              {loading ? (
                <div className="bk-grid">{[1,2,3].map(i => <div key={i} style={{ background:'#13151c',border:'1px solid #1e2030',borderRadius:16,padding:26,display:'flex',flexDirection:'column',gap:14 }}><Skeleton w={70} h={14} delay={i*.1}/><Skeleton w={150} h={18} delay={i*.1+.05}/><Skeleton w={100} h={12} delay={i*.1+.1}/><Skeleton w="100%" h={36} r={10} delay={i*.1+.15}/></div>)}</div>
              ) : books.length === 0 ? (
                <div className="empty"><div style={{ fontSize: 36, marginBottom: 12 }}>📭</div><p>Nenhum livro disponível ainda.</p></div>
              ) : (
                <div className="bk-grid">
                  {books.map((book, i) => {
                    const c = col(book.subject)
                    const prog = analytics?.progressoLivros?.find(p => p.bookId?.toString() === book._id)
                    return (
                      <div key={book._id} className="bk-card" style={{ animationDelay: `${i*.07}s` }} onClick={() => navigate(`/book/${book._id}`)}>
                        <span className="bk-subj" style={{ background:`${c}18`,color:c }}>{book.subject}</span>
                        <h3 className="bk-title">{book.title}</h3>
                        <div style={{ fontSize: 12, color: '#4a4d60', display:'flex', alignItems:'center', gap:6 }}>
                          <span>🧙</span><span>{book.characterName}</span>
                          {prog && <span style={{ marginLeft:'auto', color:'#10b981' }}>● Em andamento</span>}
                        </div>
                        {prog && (
                          <div>
                            <div className="prog-bar-track">
                              <div className="prog-bar-fill" style={{ width:`${prog.percentual}%`,background:c }} />
                            </div>
                            <div style={{ fontSize: 10, color:'#4a4d60', marginTop:4, textAlign:'right' }}>{prog.percentual}% concluído</div>
                          </div>
                        )}
                        <button className="bk-btn" style={{ background:`${c}18`,color:c }}>
                          {prog ? 'Continuar jornada →' : 'Iniciar jornada →'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}

          {/* ── PAINEL ── */}
          {tab === 'painel' && (
            <>
              <div className="section-header" style={{ marginBottom: 28 }}>
                <div>
                  <div style={{ fontSize: 13, color: '#4a4d60', marginBottom: 6 }}>Suas métricas de aprendizado</div>
                  <h2 style={{ fontFamily: 'Lora,serif', fontSize: 28, color: '#f1f0ff', margin: 0 }}>Meu Painel</h2>
                </div>
                <button className="export-btn" onClick={exportToJson} disabled={exportLoading}>
                  {exportLoading ? 'Gerando...' : '⬇ Exportar JSON (Python/Excel)'}
                </button>
              </div>

              {loading ? (
                <div className="dgrid4">{[1,2,3,4].map(i=><div key={i} style={{background:'#13151c',border:'1px solid #1e2030',borderRadius:14,padding:22}}><Skeleton w={80} h={11} delay={i*.1}/><Skeleton w={60} h={28} r={4} delay={i*.1+.05}/></div>)}</div>
              ) : (
                <>
                  {/* Stats row */}
                  <div className="dgrid4" style={{ marginBottom: 24 }}>
                    <StatCard label="XP Total" value={analytics?.xp || 0} sub={`Nível ${xpLevel}`} />
                    <StatCard label="Taxa de Acerto" value={`${analytics?.taxaAcerto || 0}%`} sub={`${analytics?.totalRespostas || 0} respostas`} color="#10b981" />
                    <StatCard label="Taxa de Aprendizado" value={`${analytics?.taxaAprendizado || 0}%`} sub="correto + parcial" color="#f59e0b" />
                    <StatCard label="Livros Iniciados" value={analytics?.livrosIniciados || 0} sub={`de ${books.length} disponíveis`} color="#8b5cf6" />
                  </div>

                  <div className="dgrid2">
                    {/* Tempo de leitura */}
                    <div className="dcard">
                      <div className="dcard-title">Minutos lidos — últimos 7 dias</div>
                      {sessaoData.length > 0
                        ? <BarChart data={sessaoData} />
                        : <div style={{ color: '#4a4d60', fontSize: 13, textAlign: 'center', paddingTop: 20 }}>Sem dados de sessão ainda</div>
                      }
                      <div style={{ display:'flex', gap:16, marginTop:14 }}>
                        <div>
                          <div style={{ fontSize: 10, color:'#4a4d60', marginBottom: 3 }}>Média/dia</div>
                          <div style={{ fontFamily:'Lora,serif', fontSize: 18, color:'#f1f0ff' }}>{analytics?.mediaMinutosDia || 0} min</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 10, color:'#4a4d60', marginBottom: 3 }}>Tempo ocioso</div>
                          <div style={{ fontFamily:'Lora,serif', fontSize: 18, color:'#f87171' }}>{analytics?.totalMinutosOcioso || 0} min</div>
                        </div>
                      </div>
                    </div>

                    {/* Distribuição por gênero */}
                    <div className="dcard">
                      <div className="dcard-title">Gêneros de interesse</div>
                      {materiaData.length > 0 ? (
                        <>
                          <BarChart data={materiaData} />
                          <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:14 }}>
                            {materiaData.map(m => (
                              <span key={m.label} style={{ fontSize:11, padding:'3px 10px', borderRadius:20, background:`${m.color}18`, color:m.color }}>{m.label} · {m.value}</span>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div style={{ color:'#4a4d60', fontSize:13, textAlign:'center', paddingTop:20 }}>Inicie um livro para ver seus gêneros</div>
                      )}
                    </div>
                  </div>

                  {/* Progresso por livro */}
                  <div className="dcard">
                    <div className="dcard-title">Progresso por livro</div>
                    {analytics?.progressoLivros?.length > 0 ? (
                      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                        {analytics.progressoLivros.map((p, i) => (
                          <div key={i}>
                            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                              <div>
                                <div style={{ fontSize:13, color:'#f1f0ff', fontWeight:500 }}>{p.titulo}</div>
                                <div style={{ fontSize:11, color:col(p.materia) }}>{p.materia}</div>
                              </div>
                              <div style={{ fontSize:13, color:'#a78bfa', fontWeight:500 }}>{p.percentual}%</div>
                            </div>
                            <div className="prog-bar-track">
                              <div className="prog-bar-fill" style={{ width:`${p.percentual}%`, background:col(p.materia) }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ color:'#4a4d60', fontSize:13, textAlign:'center', padding:'20px 0' }}>Nenhum livro iniciado ainda</div>
                    )}
                  </div>

                  <div style={{ marginTop:16, padding:14, background:'rgba(16,185,129,.06)', border:'1px solid rgba(16,185,129,.15)', borderRadius:12 }}>
                    <div style={{ fontSize:12, color:'#6ee7b7', fontWeight:500, marginBottom:6 }}>💡 Como usar a exportação</div>
                    <div style={{ fontSize:12, color:'#4a4d60', lineHeight:1.7 }}>
                      Clique em <strong style={{color:'#c9c8d6'}}>Exportar JSON</strong> para baixar um arquivo com todos os seus dados. No Python, use <code style={{background:'#1e2030',padding:'1px 6px',borderRadius:4,fontSize:11}}>pd.read_json('arquivo.json')</code> e depois <code style={{background:'#1e2030',padding:'1px 6px',borderRadius:4,fontSize:11}}>df.to_excel('relatorio.xlsx')</code> para gerar a planilha Excel.
                    </div>
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
