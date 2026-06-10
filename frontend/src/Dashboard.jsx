import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from './api'

const SUBJECT_COLORS = {
  'Programação':'#6366f1','Matemática':'#f59e0b','Física':'#10b981',
  'História':'#ef4444','Biologia':'#84cc16','Química':'#8b5cf6',
  'Literatura':'#ec4899','Filosofia':'#06b6d4','Outros':'#6b7280',
}
const col = s => SUBJECT_COLORS[s] || '#6366f1'

const SUBJECT_BG = {
  'Programação':'📟','Matemática':'📐','Física':'⚛️',
  'História':'🏛️','Biologia':'🧬','Química':'🧪',
  'Literatura':'📜','Filosofia':'🔭','Outros':'📖',
}
const icon = s => SUBJECT_BG[s] || '📖'

function SkeletonBook() {
  return (
    <div style={{background:'#12100e',border:'1px solid #2a2520',borderRadius:16,padding:'0 0 20px',overflow:'hidden'}}>
      <div style={{height:80,background:'linear-gradient(90deg,#1a1714 25%,#211e1a 50%,#1a1714 75%)',backgroundSize:'200% 100%',animation:'sk 1.4s infinite'}}/>
      <div style={{padding:'16px 20px 0',display:'flex',flexDirection:'column',gap:10}}>
        {[60,130,90,36].map((w,i)=>(
          <div key={i} style={{height:i===1?16:11,width:w,borderRadius:4,background:'linear-gradient(90deg,#1a1714 25%,#211e1a 50%,#1a1714 75%)',backgroundSize:'200% 100%',animation:`sk 1.4s ${i*.1}s infinite`}}/>
        ))}
      </div>
    </div>
  )
}

function StatCard({label,value,sub,color='#d4a96a'}) {
  return (
    <div style={{background:'#12100e',border:'1px solid #2a2520',borderRadius:14,padding:'20px 22px'}}>
      <div style={{fontSize:11,textTransform:'uppercase',letterSpacing:'.08em',color:'#5a5248',marginBottom:10,fontWeight:500}}>{label}</div>
      <div style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:30,fontWeight:700,color:'#f5ede0',letterSpacing:'-.01em',lineHeight:1}}>{value}</div>
      {sub && <div style={{fontSize:12,color,marginTop:6}}>{sub}</div>}
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
      const blob = new Blob([JSON.stringify(data,null,2)],{type:'application/json'})
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `arcano_saber_${new Date().toISOString().split('T')[0]}.json`
      a.click()
    }
    setExportLoading(false)
  }

  const level = analytics?.nivel || 1
  const xpProgress = analytics ? analytics.xp % 100 : 0
  const sessaoData = analytics?.sessoes?.slice(-7) || []
  const maxMin = Math.max(...sessaoData.map(s=>s.minutesRead),1)
  const materiaData = Object.entries(analytics?.distribuicaoMaterias||{})

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Outfit:wght@300;400;500;600&family=Geist+Mono:wght@400;500&display=swap');
        @keyframes sk{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        .d-root { min-height:100dvh; background:#0e0c0a; font-family:'Outfit',sans-serif; color:#9a9188; }

        /* NAV */
        .d-nav { display:flex; align-items:center; justify-content:space-between; padding:0 48px; height:60px; border-bottom:1px solid #1e1a16; position:sticky; top:0; background:rgba(14,12,10,.95); backdrop-filter:blur(20px); z-index:20; }
        .d-brand { display:flex; align-items:center; gap:10px; cursor:pointer; }
        .d-brand-mark { width:32px; height:32px; background:linear-gradient(135deg,#c4944a,#8b5e2a); border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:15px; }
        .d-brand-name { font-family:'Playfair Display',Georgia,serif; font-size:17px; font-weight:700; color:#f5ede0; letter-spacing:.01em; }
        .d-nav-right { display:flex; align-items:center; gap:10px; }
        .d-user-pill { display:flex; align-items:center; gap:10px; padding:7px 14px; border:1px solid #2a2520; border-radius:24px; background:#12100e; cursor:pointer; transition:border-color .2s; }
        .d-user-pill:hover { border-color:#3a3028; }
        .d-avatar { width:26px; height:26px; border-radius:50%; background:linear-gradient(135deg,#c4944a,#8b5e2a); display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; color:#0e0c0a; flex-shrink:0; }
        .d-user-name { font-size:13px; color:#f5ede0; font-weight:500; }
        .d-user-lvl { font-size:10px; color:#5a5248; }
        .d-xp-bar { width:48px; height:2px; background:#1e1a16; border-radius:1px; }
        .d-xp-fill { height:100%; background:#c4944a; border-radius:1px; transition:width .6s; }
        .d-xp-num { font-family:'Geist Mono',monospace; font-size:11px; color:#5a5248; }
        .d-logout { padding:7px 14px; background:none; border:1px solid #2a2520; color:#5a5248; font-size:12px; border-radius:8px; cursor:pointer; font-family:'Outfit',sans-serif; transition:all .2s; }
        .d-logout:hover { color:#9a9188; border-color:#3a3028; }

        /* TABS */
        .d-tabs { display:flex; padding:0 48px; border-bottom:1px solid #1e1a16; background:#0e0c0a; }
        .d-tab { padding:14px 4px; margin-right:28px; border:none; background:transparent; font-size:13px; font-weight:500; color:#5a5248; cursor:pointer; font-family:'Outfit',sans-serif; border-bottom:1.5px solid transparent; transition:all .2s; margin-bottom:-1px; }
        .d-tab.active { color:#f5ede0; border-bottom-color:#c4944a; }

        /* HERO */
        .d-hero { background:linear-gradient(180deg,#141009 0%,#0e0c0a 100%); padding:52px 48px 44px; border-bottom:1px solid #1e1a16; position:relative; overflow:hidden; }
        .d-hero-lines { position:absolute; inset:0; background-image:repeating-linear-gradient(0deg,transparent,transparent 39px,#1a1510 40px); opacity:.4; pointer-events:none; }
        .d-hero-glow { position:absolute; width:400px; height:200px; background:radial-gradient(ellipse,rgba(196,148,74,.06) 0%,transparent 70%); top:0; left:48px; pointer-events:none; }
        .d-hero-greeting { font-size:12px; color:#5a5248; margin-bottom:10px; letter-spacing:.04em; text-transform:uppercase; }
        .d-hero-title { font-family:'Playfair Display',Georgia,serif; font-size:clamp(28px,3vw,40px); font-weight:700; color:#f5ede0; letter-spacing:-.01em; line-height:1.15; margin-bottom:8px; }
        .d-hero-sub { font-size:14px; color:#5a5248; line-height:1.6; }
        .d-hero-stats { display:flex; gap:32px; margin-top:28px; }
        .d-hero-stat { display:flex; align-items:center; gap:10px; }
        .d-hero-stat-icon { width:32px; height:32px; border:1px solid #2a2520; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:14px; background:#12100e; }
        .d-hero-stat-val { font-family:'Playfair Display',serif; font-size:18px; font-weight:700; color:#f5ede0; line-height:1; }
        .d-hero-stat-lbl { font-size:11px; color:#5a5248; margin-top:2px; }

        /* BODY */
        .d-body { max-width:1120px; margin:0 auto; padding:44px 48px 100px; }

        /* SECTION */
        .d-sec-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; }
        .d-sec-label { font-size:11px; text-transform:uppercase; letter-spacing:.1em; color:#3a3028; font-weight:600; }
        .d-sec-count { font-size:12px; color:#3a3028; }

        /* BOOK GRID */
        .d-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:18px; }
        .d-book { background:#12100e; border:1px solid #2a2520; border-radius:16px; overflow:hidden; cursor:pointer; transition:border-color .2s,transform .2s,box-shadow .2s; animation:fadeUp .4s ease both; display:flex; flex-direction:column; }
        .d-book:hover { border-color:#3a3028; transform:translateY(-3px); box-shadow:0 16px 40px rgba(0,0,0,.4); }
        .d-book-cover { height:90px; display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden; font-size:36px; }
        .d-book-cover::after { content:''; position:absolute; inset:0; background:linear-gradient(180deg,transparent 40%,rgba(18,16,14,.9)); }
        .d-book-body { padding:16px 18px 18px; flex:1; display:flex; flex-direction:column; gap:10px; }
        .d-book-subj { font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:.08em; display:inline-flex; align-items:center; gap:5px; }
        .d-book-dot { width:4px; height:4px; border-radius:50%; flex-shrink:0; }
        .d-book-title { font-family:'Playfair Display',Georgia,serif; font-size:15px; font-weight:600; color:#f5ede0; line-height:1.35; flex:1; }
        .d-book-meta { font-size:11px; color:#3a3028; display:flex; align-items:center; gap:5px; }
        .d-book-prog { }
        .d-book-progbar { height:2px; background:#1e1a16; border-radius:1px; margin-bottom:4px; }
        .d-book-progfill { height:100%; border-radius:1px; transition:width .5s; }
        .d-book-progpct { font-size:10px; color:#3a3028; text-align:right; font-family:'Geist Mono',monospace; }
        .d-book-btn { padding:9px 14px; border:1px solid #2a2520; border-radius:8px; background:transparent; font-size:12px; font-weight:500; cursor:pointer; font-family:'Outfit',sans-serif; color:#9a9188; transition:all .2s; text-align:center; width:100%; }
        .d-book-btn:hover { background:#1a1714; color:#f5ede0; border-color:#3a3028; }
        .d-book-btn.started { border-color:#c4944a33; color:#c4944a; }
        .d-book-btn.started:hover { background:#c4944a15; }

        /* STATS */
        .d-stats4 { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:28px; }

        /* CHARTS */
        .d-charts2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px; }
        .d-chart { background:#12100e; border:1px solid #2a2520; border-radius:14px; padding:22px 24px; }
        .d-chart-title { font-size:10px; text-transform:uppercase; letter-spacing:.1em; color:#3a3028; font-weight:600; margin-bottom:18px; }
        .d-bar-row { display:flex; align-items:flex-end; gap:6px; height:72px; }
        .d-bar-col { flex:1; display:flex; flex-direction:column; align-items:center; gap:4px; }
        .d-bar { width:100%; border-radius:3px 3px 0 0; min-height:3px; transition:height .4s; }
        .d-bar-lbl { font-size:9px; color:#3a3028; font-family:'Geist Mono',monospace; }
        .d-materia-list { display:flex; flex-direction:column; gap:12px; }
        .d-mat-row { display:flex; align-items:center; gap:10px; }
        .d-mat-lbl { font-size:12px; color:#6a6258; min-width:88px; }
        .d-mat-track { flex:1; height:3px; background:#1e1a16; border-radius:2px; }
        .d-mat-fill { height:100%; border-radius:2px; }
        .d-mat-val { font-family:'Geist Mono',monospace; font-size:11px; color:#3a3028; min-width:16px; text-align:right; }

        /* PROG TABLE */
        .d-prog-table { background:#12100e; border:1px solid #2a2520; border-radius:14px; overflow:hidden; margin-bottom:16px; }
        .d-prog-row { display:flex; align-items:center; gap:20px; padding:16px 22px; border-bottom:1px solid #1a1714; }
        .d-prog-row:last-child { border-bottom:none; }
        .d-prog-icon { font-size:18px; flex-shrink:0; }
        .d-prog-info { flex:1; min-width:0; }
        .d-prog-title { font-size:13px; color:#f5ede0; font-weight:500; }
        .d-prog-sub { font-size:11px; color:#3a3028; margin-top:2px; }
        .d-prog-bar-wrap { width:100px; flex-shrink:0; }
        .d-prog-bar-track { height:2px; background:#1e1a16; border-radius:1px; }
        .d-prog-bar-fill { height:100%; border-radius:1px; }
        .d-prog-pct { font-family:'Geist Mono',monospace; font-size:12px; color:#6a6258; min-width:38px; text-align:right; }

        /* EXPORT */
        .d-export-btn { padding:8px 16px; background:transparent; border:1px solid #2a2520; color:#5a5248; font-size:12px; font-weight:500; border-radius:8px; cursor:pointer; font-family:'Outfit',sans-serif; transition:all .2s; }
        .d-export-btn:hover { border-color:#3a3028; color:#9a9188; }

        /* CODE BLOCK */
        .d-code { background:#12100e; border:1px solid #2a2520; border-radius:12px; padding:16px 20px; }
        .d-code-title { font-size:10px; text-transform:uppercase; letter-spacing:.08em; color:#3a3028; font-weight:600; margin-bottom:10px; }
        .d-code pre { font-family:'Geist Mono',monospace; font-size:12px; color:#5a5248; line-height:1.9; }

        /* EMPTY */
        .d-empty { grid-column:1/-1; padding:80px 0; text-align:center; border:1px dashed #2a2520; border-radius:16px; }
        .d-empty-icon { font-size:36px; margin-bottom:12px; }
        .d-empty-title { font-size:14px; color:#3a3028; }

        @media(max-width:900px){
          .d-nav,.d-tabs,.d-body{padding-left:24px;padding-right:24px;}
          .d-hero{padding:36px 24px 32px;}
          .d-stats4{grid-template-columns:1fr 1fr;}
          .d-charts2{grid-template-columns:1fr;}
          .d-hero-stats{flex-wrap:wrap;gap:16px;}
        }
      `}</style>

      <div className="d-root">
        {/* NAV */}
        <nav className="d-nav">
          <div className="d-brand" onClick={() => navigate('/dashboard')}>
            <div className="d-brand-mark">📖</div>
            <span className="d-brand-name">Arcano Saber</span>
          </div>
          <div className="d-nav-right">
            {user && (
              <div className="d-user-pill" onClick={() => setTab('panel')}>
                <div className="d-avatar">{user.name?.[0]?.toUpperCase()}</div>
                <div>
                  <div className="d-user-name">{user.name.split(' ')[0]}</div>
                  <div className="d-user-lvl">Nível {level}</div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <div className="d-xp-bar"><div className="d-xp-fill" style={{width:`${xpProgress}%`}}/></div>
                  <span className="d-xp-num">{analytics?.xp||0}</span>
                </div>
              </div>
            )}
            <button className="d-logout" onClick={()=>{localStorage.clear();navigate('/')}}>Sair</button>
          </div>
        </nav>

        {/* TABS */}
        <div className="d-tabs">
          <button className={`d-tab ${tab==='library'?'active':''}`} onClick={()=>setTab('library')}>Biblioteca</button>
          <button className={`d-tab ${tab==='panel'?'active':''}`} onClick={()=>setTab('panel')}>Meu Painel</button>
        </div>

        {/* HERO */}
        {tab === 'library' && (
          <div className="d-hero">
            <div className="d-hero-lines"/>
            <div className="d-hero-glow"/>
            <div style={{position:'relative'}}>
              <div className="d-hero-greeting">Bem-vindo de volta, {user?.name?.split(' ')[0] || 'leitor'}</div>
              <h2 className="d-hero-title">
                {analytics?.livrosIniciados > 0
                  ? 'Continue sua jornada.'
                  : 'Escolha seu primeiro livro.'}
              </h2>
              <div className="d-hero-sub">
                {books.length} título{books.length!==1?'s':''} disponíve{books.length!==1?'is':'l'} na biblioteca.
              </div>
              {analytics && (
                <div className="d-hero-stats">
                  <div className="d-hero-stat">
                    <div className="d-hero-stat-icon">⚡</div>
                    <div>
                      <div className="d-hero-stat-val">{analytics.xp} XP</div>
                      <div className="d-hero-stat-lbl">Nível {level}</div>
                    </div>
                  </div>
                  <div className="d-hero-stat">
                    <div className="d-hero-stat-icon">🎯</div>
                    <div>
                      <div className="d-hero-stat-val">{analytics.taxaAcerto}%</div>
                      <div className="d-hero-stat-lbl">Taxa de acerto</div>
                    </div>
                  </div>
                  <div className="d-hero-stat">
                    <div className="d-hero-stat-icon">📚</div>
                    <div>
                      <div className="d-hero-stat-val">{analytics.livrosIniciados}</div>
                      <div className="d-hero-stat-lbl">Livros iniciados</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="d-body">
          {/* ── BIBLIOTECA ── */}
          {tab === 'library' && (
            <>
              <div className="d-sec-head">
                <span className="d-sec-label">Todos os livros</span>
                {!loading && <span className="d-sec-count">{books.length} título{books.length!==1?'s':''}</span>}
              </div>
              <div className="d-grid">
                {loading
                  ? [1,2,3,4].map(i=><SkeletonBook key={i}/>)
                  : books.length===0
                  ? <div className="d-empty"><div className="d-empty-icon">📭</div><div className="d-empty-title">Nenhum livro disponível ainda.</div></div>
                  : books.map((book,i)=>{
                    const c = col(book.subject)
                    const ic = icon(book.subject)
                    const prog = analytics?.progressoLivros?.find(p=>p.bookId?.toString()===book._id)
                    return (
                      <div key={book._id} className="d-book" style={{animationDelay:`${i*.07}s`}} onClick={()=>navigate(`/book/${book._id}`)}>
                        <div className="d-book-cover" style={{background:`linear-gradient(135deg,${c}22,${c}08)`}}>
                          <span style={{position:'relative',zIndex:1}}>{ic}</span>
                        </div>
                        <div className="d-book-body">
                          <div className="d-book-subj" style={{color:c}}>
                            <div className="d-book-dot" style={{background:c}}/>
                            {book.subject}
                          </div>
                          <div className="d-book-title">{book.title}</div>
                          <div className="d-book-meta">
                            🧙 {book.characterName}
                            {prog&&<span style={{marginLeft:'auto',color:'#c4944a',fontSize:10}}>Em andamento</span>}
                          </div>
                          {prog&&(
                            <div className="d-book-prog">
                              <div className="d-book-progbar"><div className="d-book-progfill" style={{width:`${prog.percentual}%`,background:c}}/></div>
                              <div className="d-book-progpct">{prog.percentual}%</div>
                            </div>
                          )}
                          <button className={`d-book-btn ${prog?'started':''}`} onClick={e=>{e.stopPropagation();navigate(`/book/${book._id}`)}}>
                            {prog?'Continuar leitura →':'Começar →'}
                          </button>
                        </div>
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
              <div className="d-sec-head" style={{marginBottom:28}}>
                <span className="d-sec-label">Suas métricas</span>
                <button className="d-export-btn" onClick={exportJson} disabled={exportLoading}>
                  {exportLoading?'Gerando...':'Exportar JSON'}
                </button>
              </div>

              {loading ? (
                <div style={{color:'#3a3028',textAlign:'center',padding:'40px 0',fontSize:14}}>Carregando...</div>
              ) : analytics && (
                <>
                  <div className="d-stats4">
                    <StatCard label="XP Total" value={analytics.xp} sub={`Nível ${level}`}/>
                    <StatCard label="Acertos" value={`${analytics.taxaAcerto}%`} sub={`${analytics.totalRespostas} respostas`} color="#10b981"/>
                    <StatCard label="Aprendizado" value={`${analytics.taxaAprendizado}%`} sub="correto + parcial" color="#6366f1"/>
                    <StatCard label="Livros" value={analytics.livrosIniciados} sub={`de ${books.length} disponíveis`} color="#5a5248"/>
                  </div>

                  <div className="d-charts2">
                    <div className="d-chart">
                      <div className="d-chart-title">Minutos lidos — 7 dias</div>
                      {sessaoData.length>0?(
                        <>
                          <div className="d-bar-row">
                            {sessaoData.map((s,i)=>(
                              <div key={i} className="d-bar-col">
                                <div className="d-bar" style={{height:`${(s.minutesRead/maxMin)*64}px`,background:'#c4944a'}}/>
                                <div className="d-bar-lbl">{s.date.slice(5)}</div>
                              </div>
                            ))}
                          </div>
                          <div style={{display:'flex',gap:20,marginTop:16}}>
                            <div>
                              <div style={{fontSize:10,color:'#3a3028',marginBottom:4,textTransform:'uppercase',letterSpacing:'.06em'}}>Média/dia</div>
                              <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:'#f5ede0'}}>{analytics.mediaMinutosDia}<span style={{fontSize:11,color:'#3a3028',marginLeft:3,fontFamily:'Outfit'}}>min</span></div>
                            </div>
                            <div>
                              <div style={{fontSize:10,color:'#3a3028',marginBottom:4,textTransform:'uppercase',letterSpacing:'.06em'}}>Ocioso</div>
                              <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:'#ef4444'}}>{analytics.totalMinutosOcioso}<span style={{fontSize:11,color:'#3a3028',marginLeft:3,fontFamily:'Outfit'}}>min</span></div>
                            </div>
                          </div>
                        </>
                      ):<div style={{color:'#3a3028',fontSize:13,paddingTop:8}}>Sem dados de sessão ainda.</div>}
                    </div>

                    <div className="d-chart">
                      <div className="d-chart-title">Gêneros de interesse</div>
                      {materiaData.length>0?(
                        <div className="d-materia-list">
                          {materiaData.map(([k,v])=>{
                            const mx=Math.max(...materiaData.map(([,n])=>n),1)
                            return(
                              <div key={k} className="d-mat-row">
                                <div className="d-mat-lbl">{k}</div>
                                <div className="d-mat-track"><div className="d-mat-fill" style={{width:`${(v/mx)*100}%`,background:col(k)}}/></div>
                                <div className="d-mat-val">{v}</div>
                              </div>
                            )
                          })}
                        </div>
                      ):<div style={{color:'#3a3028',fontSize:13}}>Inicie um livro para ver.</div>}
                    </div>
                  </div>

                  {analytics.progressoLivros?.length>0&&(
                    <>
                      <div className="d-sec-head" style={{marginBottom:12}}>
                        <span className="d-sec-label">Progresso por livro</span>
                      </div>
                      <div className="d-prog-table">
                        {analytics.progressoLivros.map((p,i)=>(
                          <div key={i} className="d-prog-row">
                            <div className="d-prog-icon">{icon(p.materia)}</div>
                            <div className="d-prog-info">
                              <div className="d-prog-title">{p.titulo}</div>
                              <div className="d-prog-sub">{p.materia} · {p.cenesCompletas}/{p.totalCenas} cenas</div>
                            </div>
                            <div className="d-prog-bar-wrap">
                              <div className="d-prog-bar-track"><div className="d-prog-bar-fill" style={{width:`${p.percentual}%`,background:col(p.materia)}}/></div>
                            </div>
                            <div className="d-prog-pct">{p.percentual}%</div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  <div className="d-code">
                    <div className="d-code-title">Importar no Python</div>
                    <pre>{`import pandas as pd\ndf = pd.read_json('arcano_saber_report.json')\ndf.to_excel('relatorio.xlsx', index=False)`}</pre>
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
