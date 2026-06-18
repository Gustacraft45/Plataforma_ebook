import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from './api'
import EmailMotivacionalBtn from './components/EmailMotivacionalBtn'

const SUBJECT_COLORS = {
  'Programação':'#7c5c3e','Matemática':'#b5850a','Física':'#2d7a5f',
  'História':'#8b3a3a','Biologia':'#4a7c3f','Química':'#5c4a8b',
  'Literatura':'#8b4a6b','Filosofia':'#3a6b8b','Outros':'#6b5a4a',
}
const SUBJECT_ICONS = {
  'Programação':'💻','Matemática':'📐','Física':'⚛️',
  'História':'🏛️','Biologia':'🌿','Química':'🧪',
  'Literatura':'📜','Filosofia':'🔭','Outros':'📖',
}
const col = s => SUBJECT_COLORS[s]||'#7c5c3e'
const icon = s => SUBJECT_ICONS[s]||'📖'

function SkeletonCard() {
  return (
    <div style={{background:'#fffdf9',border:'1px solid #e8ddd0',borderRadius:16,overflow:'hidden'}}>
      <div style={{height:100,background:'linear-gradient(90deg,#f0e8dd 25%,#f7f0e8 50%,#f0e8dd 75%)',backgroundSize:'200% 100%',animation:'sk 1.4s infinite'}}/>
      <div style={{padding:'16px 18px',display:'flex',flexDirection:'column',gap:10}}>
        {[50,120,80,36].map((w,i)=>(<div key={i} style={{height:i===1?15:11,width:w,borderRadius:4,background:'linear-gradient(90deg,#f0e8dd 25%,#f7f0e8 50%,#f0e8dd 75%)',backgroundSize:'200% 100%',animation:`sk 1.4s ${i*.1}s infinite`}}/>))}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [books,setBooks]=useState([])
  const [analytics,setAnalytics]=useState(null)
  const [user,setUser]=useState(null)
  const [loading,setLoading]=useState(true)
  const [tab,setTab]=useState('library')
  const [exportLoading,setExportLoading]=useState(false)
  const navigate=useNavigate()
  const handleUnauth=useCallback(()=>{localStorage.clear();navigate('/')},[navigate])

  useEffect(()=>{
    const load=async()=>{
      const [br,ur,ar]=await Promise.all([api.books.list(),api.user.me(),api.user.analytics()])
      if(!br.ok){handleUnauth();return}
      setBooks(br.data); if(ur.ok)setUser(ur.data); if(ar.ok)setAnalytics(ar.data); setLoading(false)
    }; load()
  },[handleUnauth])

  const exportJson=async()=>{
    setExportLoading(true)
    const{ok,data}=await api.user.report()
    if(ok){const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`arcano_saber_${new Date().toISOString().split('T')[0]}.json`;a.click()}
    setExportLoading(false)
  }

  const level=analytics?.nivel||1
  const xpProgress=analytics?analytics.xp%100:0
  const sessaoData=analytics?.sessoes?.slice(-7)||[]
  const maxMin=Math.max(...sessaoData.map(s=>s.minutesRead),1)
  const materiaData=Object.entries(analytics?.distribuicaoMaterias||{})

  return (<>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Nunito:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap');
      @keyframes sk{0%{background-position:200% 0}100%{background-position:-200% 0}}
      @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
      @keyframes pulse-d{0%,100%{opacity:1}50%{opacity:.3}}
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
      .dr{min-height:100dvh;background:#faf6f0;font-family:'Nunito',sans-serif;color:#5a4a3a;}
      .dn{display:flex;align-items:center;justify-content:space-between;padding:0 48px;height:64px;border-bottom:1px solid #e8ddd0;position:sticky;top:0;background:rgba(250,246,240,.97);backdrop-filter:blur(12px);z-index:20;}
      .dn-brand{display:flex;align-items:center;gap:10px;cursor:pointer;}
      .dn-mark{width:36px;height:36px;background:linear-gradient(135deg,#8b5e3c,#6b3e1c);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:17px;box-shadow:0 2px 8px rgba(107,62,28,.25);}
      .dn-name{font-family:'Playfair Display',serif;font-size:19px;font-weight:700;color:#3a2a1a;}
      .dn-r{display:flex;align-items:center;gap:10px;}
      .dn-pill{display:flex;align-items:center;gap:10px;padding:8px 16px;border:1.5px solid #e0d4c4;border-radius:24px;background:#fff8f0;cursor:pointer;transition:all .2s;box-shadow:0 1px 4px rgba(90,60,30,.06);}
      .dn-pill:hover{border-color:#c4a882;box-shadow:0 2px 8px rgba(90,60,30,.1);}
      .dn-av{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#c4944a,#8b5e3c);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff8f0;flex-shrink:0;}
      .dn-uname{font-size:13px;color:#3a2a1a;font-weight:600;}
      .dn-ulvl{font-size:10px;color:#9a8878;}
      .dn-xpbar{width:48px;height:3px;background:#e8ddd0;border-radius:2px;}
      .dn-xpfill{height:100%;background:linear-gradient(90deg,#c4944a,#e8b86d);border-radius:2px;transition:width .6s;}
      .dn-xpnum{font-family:'Geist Mono',monospace;font-size:11px;color:#9a8878;}
      .dn-out{padding:8px 16px;background:none;border:1.5px solid #e0d4c4;color:#9a8878;font-size:12px;border-radius:10px;cursor:pointer;font-family:'Nunito',sans-serif;font-weight:600;transition:all .2s;}
      .dn-out:hover{color:#5a4a3a;border-color:#c4a882;}
      .dt{display:flex;padding:0 48px;border-bottom:1px solid #e8ddd0;background:#faf6f0;}
      .dt-btn{padding:16px 4px;margin-right:28px;border:none;background:transparent;font-size:14px;font-weight:600;color:#b0a090;cursor:pointer;font-family:'Nunito',sans-serif;border-bottom:2px solid transparent;transition:all .2s;margin-bottom:-1px;}
      .dt-btn.active{color:#3a2a1a;border-bottom-color:#c4944a;}
      .dh{background:linear-gradient(135deg,#3a2210 0%,#5a3520 50%,#7a4a28 100%);padding:56px 48px 48px;position:relative;overflow:hidden;}
      .dh-tex{position:absolute;inset:0;opacity:.4;background-image:url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M20 0v40M0 20h40'/%3E%3C/g%3E%3C/svg%3E");pointer-events:none;}
      .dh-glow{position:absolute;width:500px;height:300px;background:radial-gradient(ellipse,rgba(196,148,74,.12) 0%,transparent 70%);bottom:-50px;right:0;pointer-events:none;}
      .dh-tag{display:inline-flex;align-items:center;gap:7px;font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:#d4aa7a;margin-bottom:14px;font-weight:700;}
      .dh-dot{width:5px;height:5px;border-radius:50%;background:#c4944a;animation:pulse-d 2s infinite;}
      .dh-h{font-family:'Playfair Display',serif;font-size:clamp(26px,3vw,38px);font-weight:700;color:#fff8f0;letter-spacing:-.01em;line-height:1.2;margin-bottom:8px;}
      .dh-sub{font-size:14px;color:#d4aa7a;opacity:.8;}
      .dh-pills{display:flex;gap:14px;margin-top:28px;flex-wrap:wrap;}
      .dh-pill{display:flex;align-items:center;gap:10px;background:rgba(255,248,240,.08);border:1px solid rgba(255,248,240,.12);border-radius:12px;padding:12px 16px;}
      .dh-pval{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:#fff8f0;line-height:1;}
      .dh-plbl{font-size:10px;color:#d4aa7a;margin-top:2px;text-transform:uppercase;letter-spacing:.06em;}
      .db{max-width:1120px;margin:0 auto;padding:44px 48px 100px;}
      .dsl{display:flex;align-items:center;justify-content:space-between;margin-bottom:22px;}
      .dsl-l{font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#b0a090;font-weight:700;}
      .dsl-c{font-size:12px;color:#c4a882;}
      .dg{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:20px;}
      .bk{background:#fffdf9;border:1.5px solid #e8ddd0;border-radius:16px;overflow:hidden;cursor:pointer;transition:all .25s;animation:fadeUp .4s ease both;display:flex;flex-direction:column;box-shadow:0 2px 8px rgba(90,60,30,.06);}
      .bk:hover{border-color:#c4a882;transform:translateY(-4px);box-shadow:0 12px 32px rgba(90,60,30,.14);}
      .bk-cov{height:100px;display:flex;align-items:center;justify-content:center;font-size:40px;position:relative;}
      .bk-cov::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 30%,rgba(255,253,249,.95));}
      .bk-body{padding:14px 18px 18px;flex:1;display:flex;flex-direction:column;gap:10px;}
      .bk-subj{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;display:inline-flex;align-items:center;gap:5px;}
      .bk-dot{width:4px;height:4px;border-radius:50%;}
      .bk-title{font-family:'Playfair Display',serif;font-size:15px;font-weight:600;color:#3a2a1a;line-height:1.35;flex:1;}
      .bk-meta{font-size:11px;color:#b0a090;display:flex;align-items:center;gap:5px;}
      .bk-pb{height:3px;background:#f0e8dd;border-radius:2px;margin-bottom:3px;}
      .bk-pf{height:100%;border-radius:2px;transition:width .5s;}
      .bk-pp{font-size:10px;color:#c4a882;text-align:right;font-family:'Geist Mono',monospace;}
      .bk-btn{padding:10px 14px;border:1.5px solid #e8ddd0;border-radius:10px;background:transparent;font-size:12px;font-weight:700;cursor:pointer;font-family:'Nunito',sans-serif;color:#7a5a3a;transition:all .2s;text-align:center;width:100%;}
      .bk-btn:hover{background:#f5ede0;border-color:#c4a882;color:#3a2a1a;}
      .bk-btn.on{background:linear-gradient(135deg,#8b5e3c,#c4944a);border-color:transparent;color:#fff8f0;box-shadow:0 2px 8px rgba(139,94,60,.3);}
      .bk-btn.on:hover{opacity:.9;}
      .ds4{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:28px;}
      .dsc{background:#fffdf9;border:1.5px solid #e8ddd0;border-radius:14px;padding:22px 24px;box-shadow:0 2px 6px rgba(90,60,30,.05);}
      .dsc-l{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#b0a090;margin-bottom:10px;font-weight:700;}
      .dsc-v{font-family:'Playfair Display',serif;font-size:30px;font-weight:700;color:#3a2a1a;line-height:1;}
      .dsc-s{font-size:12px;margin-top:6px;}
      .dc2{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;}
      .dch{background:#fffdf9;border:1.5px solid #e8ddd0;border-radius:14px;padding:22px 24px;box-shadow:0 2px 6px rgba(90,60,30,.05);}
      .dch-t{font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:#b0a090;font-weight:700;margin-bottom:18px;}
      .dbr{display:flex;align-items:flex-end;gap:6px;height:72px;}
      .dbc{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;}
      .dbar{width:100%;border-radius:4px 4px 0 0;min-height:4px;transition:height .5s;}
      .dbl{font-size:9px;color:#c4a882;font-family:'Geist Mono',monospace;}
      .dml{display:flex;flex-direction:column;gap:14px;}
      .dmr{display:flex;align-items:center;gap:10px;}
      .dml-l{font-size:12px;color:#7a6a5a;min-width:90px;font-weight:500;}
      .dmt{flex:1;height:6px;background:#f0e8dd;border-radius:3px;overflow:hidden;}
      .dmf{height:100%;border-radius:3px;transition:width .5s;}
      .dmv{font-family:'Geist Mono',monospace;font-size:11px;color:#c4a882;min-width:18px;text-align:right;}
      .dpt{background:#fffdf9;border:1.5px solid #e8ddd0;border-radius:14px;overflow:hidden;margin-bottom:16px;box-shadow:0 2px 6px rgba(90,60,30,.05);}
      .dpr{display:flex;align-items:center;gap:16px;padding:16px 22px;border-bottom:1px solid #f0e8dd;}
      .dpr:last-child{border-bottom:none;}
      .dpr-i{font-size:20px;flex-shrink:0;}
      .dpr-info{flex:1;min-width:0;}
      .dpr-t{font-size:13px;color:#3a2a1a;font-weight:600;font-family:'Playfair Display',serif;}
      .dpr-s{font-size:11px;color:#b0a090;margin-top:2px;}
      .dpr-bar{width:100px;flex-shrink:0;}
      .dpr-track{height:4px;background:#f0e8dd;border-radius:2px;}
      .dpr-fill{height:100%;border-radius:2px;}
      .dpr-pct{font-family:'Geist Mono',monospace;font-size:12px;color:#c4a882;min-width:38px;text-align:right;}
      .dcode{background:#3a2a1a;border-radius:12px;padding:18px 22px;}
      .dcode-t{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#7a6248;font-weight:700;margin-bottom:10px;}
      .dcode pre{font-family:'Geist Mono',monospace;font-size:12px;color:#c4a882;line-height:1.9;}
      .dexp{padding:8px 18px;background:transparent;border:1.5px solid #e0d4c4;color:#9a8878;font-size:12px;font-weight:700;border-radius:10px;cursor:pointer;font-family:'Nunito',sans-serif;transition:all .2s;}
      .dexp:hover{border-color:#c4a882;color:#5a4a3a;}
      .demp{grid-column:1/-1;padding:80px 0;text-align:center;border:2px dashed #e0d4c4;border-radius:16px;}
      @media(max-width:900px){.dn,.dt,.db{padding-left:20px;padding-right:20px;}.dh{padding:36px 20px 32px;}.ds4{grid-template-columns:1fr 1fr;}.dc2{grid-template-columns:1fr;}}
    `}</style>
    <div className="dr">
      <nav className="dn">
        <div className="dn-brand" onClick={()=>navigate('/dashboard')}>
          <div className="dn-mark">📖</div>
          <span className="dn-name">Arcano Saber</span>
        </div>
        <div className="dn-r">
          {user&&(
            <div className="dn-pill" onClick={()=>setTab('panel')}>
              <div className="dn-av">{user.name?.[0]?.toUpperCase()}</div>
              <div><div className="dn-uname">{user.name.split(' ')[0]}</div><div className="dn-ulvl">Nível {level}</div></div>
              <div style={{display:'flex',alignItems:'center',gap:6}}>
                <div className="dn-xpbar"><div className="dn-xpfill" style={{width:`${xpProgress}%`}}/></div>
                <span className="dn-xpnum">{analytics?.xp||0} XP</span>
              </div>
            </div>
          )}
          <button className="dn-out" onClick={()=>{localStorage.clear();navigate('/')}}>Sair</button>
        </div>
      </nav>

      <div className="dt">
        <button className={`dt-btn ${tab==='library'?'active':''}`} onClick={()=>setTab('library')}>Biblioteca</button>
        <button className={`dt-btn ${tab==='panel'?'active':''}`} onClick={()=>setTab('panel')}>Meu Painel</button>
      </div>

      {tab==='library'&&(
        <div className="dh">
          <div className="dh-tex"/>
          <div className="dh-glow"/>
          <div style={{position:'relative'}}>
            <div className="dh-tag"><div className="dh-dot"/>Bem-vindo de volta, {user?.name?.split(' ')[0]||'leitor'}</div>
            <h2 className="dh-h">{analytics?.livrosIniciados>0?'Continue de onde parou.':'Comece sua jornada.'}</h2>
            <div className="dh-sub">{books.length} título{books.length!==1?'s':''} disponíve{books.length!==1?'is':'l'} na sua biblioteca.</div>
            {analytics&&(
              <div>
                <div className="dh-pills">
                  {[{e:'⚡',v:`${analytics.xp} XP`,l:`Nível ${level}`},{e:'🎯',v:`${analytics.taxaAcerto}%`,l:'Taxa de acerto'},{e:'📚',v:analytics.livrosIniciados,l:'Livros iniciados'}].map((s,i)=>(
                    <div key={i} className="dh-pill">
                      <span style={{fontSize:18}}>{s.e}</span>
                      <div><div className="dh-pval">{s.v}</div><div className="dh-plbl">{s.l}</div></div>
                    </div>
                  ))}
                </div>
                {analytics?.progressoLivros?.length > 0 && (() => {
                  const alvo = analytics.progressoLivros.find(p => p.percentual < 100) || analytics.progressoLivros[0]
                  if (!alvo) return null
                  const bookId = alvo.bookId
                  return (
                    <button
                      onClick={() => navigate(`/book/${bookId}`)}
                      style={{marginTop:20,display:'inline-flex',alignItems:'center',gap:12,padding:'12px 20px',background:'rgba(255,248,240,.1)',border:'1.5px solid rgba(255,248,240,.18)',borderRadius:14,color:'#fff8f0',cursor:'pointer',fontFamily:"'Nunito',sans-serif",transition:'all .2s',textAlign:'left'}}
                      onMouseEnter={e=>e.currentTarget.style.background='rgba(255,248,240,.18)'}
                      onMouseLeave={e=>e.currentTarget.style.background='rgba(255,248,240,.1)'}
                    >
                      <span style={{fontSize:20,flexShrink:0}}>📖</span>
                      <div>
                        <div style={{fontSize:10,color:'#d4aa7a',textTransform:'uppercase',letterSpacing:'.08em',fontWeight:700,marginBottom:3}}>Continuar leitura</div>
                        <div style={{fontSize:14,color:'#fff8f0',fontWeight:700,fontFamily:"'Playfair Display',serif"}}>{alvo.titulo}</div>
                        <div style={{fontSize:11,color:'rgba(255,248,240,.5)',marginTop:2}}>{alvo.cenesCompletas}/{alvo.totalCenas} cenas · {alvo.percentual}%</div>
                      </div>
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{marginLeft:4,opacity:.5,flexShrink:0}}><path d="M7 5l5 4-5 4" stroke="#fff8f0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  )
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="db">
        {tab==='library'&&(
          <>
            <div className="dsl"><span className="dsl-l">Todos os livros</span>{!loading&&<span className="dsl-c">{books.length} título{books.length!==1?'s':''}</span>}</div>
            <div className="dg">
              {loading?[1,2,3,4].map(i=><SkeletonCard key={i}/>):books.length===0?(
                <div className="demp"><div style={{fontSize:40,marginBottom:14}}>📭</div><div style={{fontSize:15,color:'#b0a090',fontWeight:500}}>Nenhum livro disponível ainda.</div></div>
              ):books.map((book,i)=>{
                const c=col(book.subject),ic=icon(book.subject)
                const prog=analytics?.progressoLivros?.find(p=>p.bookId?.toString()===book._id)
                return(
                  <div key={book._id} className="bk" style={{animationDelay:`${i*.07}s`}} onClick={()=>navigate(`/book/${book._id}`)}>
                    <div className="bk-cov" style={{background:`linear-gradient(135deg,${c}22,${c}10)`}}>
                      <span style={{position:'relative',zIndex:1}}>{ic}</span>
                    </div>
                    <div className="bk-body">
                      <div className="bk-subj" style={{color:c}}><div className="bk-dot" style={{background:c}}/>{book.subject}</div>
                      <div className="bk-title">{book.title}</div>
                      <div className="bk-meta">🧙 {book.characterName}{prog&&<span style={{marginLeft:'auto',color:'#c4944a',fontSize:10,fontWeight:700}}>Em andamento</span>}</div>
                      {prog&&<><div className="bk-pb"><div className="bk-pf" style={{width:`${prog.percentual}%`,background:c}}/></div><div className="bk-pp">{prog.percentual}% concluído</div></>}
                      <button className={`bk-btn ${prog?'on':''}`} onClick={e=>{e.stopPropagation();navigate(`/book/${book._id}`)}}>{prog?'Continuar leitura →':'Começar →'}</button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {tab==='panel'&&(
          <>
            <div className="dsl" style={{marginBottom:16}}><span className="dsl-l">Suas métricas</span><button className="dexp" onClick={exportJson} disabled={exportLoading}>{exportLoading?'Gerando...':'Exportar JSON'}</button></div>
            <EmailMotivacionalBtn style={{marginBottom:28}} />
            {loading?<div style={{color:'#b0a090',textAlign:'center',padding:'40px 0'}}>Carregando...</div>:analytics&&(<>
              <div className="ds4">
                {[{l:'XP Total',v:analytics.xp,s:`Nível ${level}`,c:'#c4944a'},{l:'Acertos',v:`${analytics.taxaAcerto}%`,s:`${analytics.totalRespostas} respostas`,c:'#2d7a5f'},{l:'Aprendizado',v:`${analytics.taxaAprendizado}%`,s:'correto + parcial',c:'#7c5c3e'},{l:'Livros',v:analytics.livrosIniciados,s:`de ${books.length} disponíveis`,c:'#b0a090'}].map((s,i)=>(
                  <div key={i} className="dsc"><div className="dsc-l">{s.l}</div><div className="dsc-v">{s.v}</div><div className="dsc-s" style={{color:s.c}}>{s.s}</div></div>
                ))}
              </div>
              <div className="dc2">
                <div className="dch">
                  <div className="dch-t">Minutos lidos — 7 dias</div>
                  {sessaoData.length>0?(<>
                    <div className="dbr">{sessaoData.map((s,i)=><div key={i} className="dbc"><div className="dbar" style={{height:`${(s.minutesRead/maxMin)*64}px`,background:'linear-gradient(180deg,#c4944a,#8b5e3c)'}}/><div className="dbl">{s.date.slice(5)}</div></div>)}</div>
                    <div style={{display:'flex',gap:24,marginTop:16}}>
                      <div><div style={{fontSize:10,color:'#b0a090',marginBottom:4,textTransform:'uppercase',letterSpacing:'.06em',fontWeight:700}}>Média/dia</div><div style={{fontFamily:"'Playfair Display',serif",fontSize:22,color:'#3a2a1a',fontWeight:700}}>{analytics.mediaMinutosDia}<span style={{fontSize:11,color:'#b0a090',marginLeft:3,fontFamily:'Nunito'}}>min</span></div></div>
                      <div><div style={{fontSize:10,color:'#b0a090',marginBottom:4,textTransform:'uppercase',letterSpacing:'.06em',fontWeight:700}}>Ocioso</div><div style={{fontFamily:"'Playfair Display',serif",fontSize:22,color:'#c47a5a',fontWeight:700}}>{analytics.totalMinutosOcioso}<span style={{fontSize:11,color:'#b0a090',marginLeft:3,fontFamily:'Nunito'}}>min</span></div></div>
                    </div>
                  </>):<div style={{color:'#c4a882',fontSize:13,paddingTop:8}}>Sem dados de sessão ainda.</div>}
                </div>
                <div className="dch">
                  <div className="dch-t">Gêneros de interesse</div>
                  {materiaData.length>0?(
                    <div className="dml">{materiaData.map(([k,v])=>{const mx=Math.max(...materiaData.map(([,n])=>n),1);return(<div key={k} className="dmr"><div className="dml-l">{k}</div><div className="dmt"><div className="dmf" style={{width:`${(v/mx)*100}%`,background:col(k)}}/></div><div className="dmv">{v}</div></div>)})}</div>
                  ):<div style={{color:'#c4a882',fontSize:13}}>Inicie um livro para ver.</div>}
                </div>
              </div>
              {analytics.progressoLivros?.length>0&&(<>
                <div className="dsl" style={{marginBottom:12}}><span className="dsl-l">Progresso por livro</span></div>
                <div className="dpt">{analytics.progressoLivros.map((p,i)=>(
                  <div key={i} className="dpr">
                    <div className="dpr-i">{icon(p.materia)}</div>
                    <div className="dpr-info"><div className="dpr-t">{p.titulo}</div><div className="dpr-s">{p.materia} · {p.cenesCompletas}/{p.totalCenas} cenas</div></div>
                    <div className="dpr-bar"><div className="dpr-track"><div className="dpr-fill" style={{width:`${p.percentual}%`,background:col(p.materia)}}/></div></div>
                    <div className="dpr-pct">{p.percentual}%</div>
                  </div>
                ))}</div>
              </>)}
              <div className="dcode"><div className="dcode-t">Importar no Python</div><pre>{`import pandas as pd\ndf = pd.read_json('arcano_saber_report.json')\ndf.to_excel('relatorio.xlsx', index=False)`}</pre></div>
            </>)}
          </>
        )}
      </div>
    </div>
  </>)
}