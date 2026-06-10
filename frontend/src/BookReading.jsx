import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from './api'

export default function BookReading() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [book, setBook] = useState(null)
  const [nodeIndex, setNodeIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [sceneKey, setSceneKey] = useState(0)
  const [xp, setXp] = useState(() => { try { return JSON.parse(localStorage.getItem('user'))?.xp||0 } catch { return 0 } })
  const [xpFlash, setXpFlash] = useState(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    api.books.get(id).then(({ ok, data }) => {
      if (!ok || !data.nodes?.length) { navigate('/dashboard'); return }
      setBook(data)
    })
  }, [id, navigate])

  const handleEvaluate = async (e) => {
    e.preventDefault()
    if (!answer.trim()) return
    setLoading(true); setResult(null)
    const scene = book.nodes[nodeIndex]
    const { ok, data } = await api.evaluate(scene.challengeQuestion, answer, scene.expectedAnswer||'')
    if (ok) {
      setResult(data)
      const isCorrect = ['correto','correct'].includes(data.status?.toLowerCase())
      const isPartial = ['parcial','partial'].includes(data.status?.toLowerCase())
      if (isCorrect||isPartial) {
        const gain = isCorrect ? 100 : 50
        const res = await api.user.progress({ bookId:id, nodeId:scene.id, currentNode:scene.id, isCorrect, status:data.status })
        if (res.ok) {
          setXp(res.data.xpTotal)
          setXpFlash(`+${gain} XP`)
          setTimeout(()=>setXpFlash(null), 2000)
          const u = JSON.parse(localStorage.getItem('user')||'{}')
          localStorage.setItem('user', JSON.stringify({...u, xp:res.data.xpTotal}))
        }
      }
    } else {
      setResult({ status:'errado', feedback:'Não foi possível conectar à IA. Tente novamente.' })
    }
    setLoading(false)
  }

  const goNext = () => {
    if (nodeIndex < book.nodes.length-1) {
      setNodeIndex(i=>i+1); setAnswer(''); setResult(null)
      setSceneKey(k=>k+1)
      window.scrollTo({top:0, behavior:'smooth'})
      setTimeout(()=>textareaRef.current?.focus(), 600)
    } else { setCompleted(true) }
  }

  if (!book) return (
    <div style={{minHeight:'100dvh',background:'#0e0c0a',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{display:'flex',gap:6}}>
        {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:'50%',background:'#2a2520',animation:`ldot .9s ${i*.15}s infinite`}}/>)}
      </div>
    </div>
  )

  if (completed) return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Outfit:wght@400;500;600&family=Geist+Mono:wght@500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        @keyframes scaleIn{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}
        @keyframes ldot{0%,80%,100%{transform:scale(.6);opacity:.3}40%{transform:scale(1);opacity:1}}
        .cp{min-height:100dvh;background:#0e0c0a;display:flex;align-items:center;justify-content:center;font-family:'Outfit',sans-serif;position:relative;overflow:hidden;}
        .cp-bg{position:absolute;inset:0;background:radial-gradient(ellipse 60% 40% at 50% 60%,rgba(196,148,74,.06) 0%,transparent 70%);pointer-events:none;}
        .cp-card{position:relative;text-align:center;max-width:420px;padding:0 28px;animation:scaleIn .5s cubic-bezier(.34,1.56,.64,1);}
        .cp-seal{width:80px;height:80px;border-radius:50%;border:1px solid #2a2520;display:flex;align-items:center;justify-content:center;margin:0 auto 28px;font-size:34px;background:#12100e;position:relative;}
        .cp-seal::after{content:'';position:absolute;inset:-6px;border-radius:50%;border:1px solid #c4944a;opacity:.25;animation:pulse-r 2.5s infinite;}
        @keyframes pulse-r{0%,100%{transform:scale(1);opacity:.25}50%{transform:scale(1.06);opacity:.08}}
        .cp-pre{font-size:11px;text-transform:uppercase;letter-spacing:.12em;color:#5a5248;margin-bottom:12px;font-weight:500;}
        .cp-title{font-family:'Playfair Display',Georgia,serif;font-size:30px;font-weight:700;color:#f5ede0;letter-spacing:-.01em;margin-bottom:12px;line-height:1.2;}
        .cp-sub{font-size:14px;color:#5a5248;line-height:1.8;margin-bottom:36px;}
        .cp-xp{font-family:'Playfair Display',serif;font-size:52px;font-weight:700;color:#f5ede0;line-height:1;margin-bottom:4px;}
        .cp-xp-lbl{font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:#3a3028;margin-bottom:36px;}
        .cp-btn{width:100%;padding:14px;background:#c4944a;color:#0e0c0a;border:none;border-radius:12px;font-size:14px;font-weight:600;cursor:pointer;font-family:'Outfit',sans-serif;transition:opacity .2s,transform .15s;letter-spacing:-.01em;}
        .cp-btn:hover{opacity:.88;transform:translateY(-1px);}
      `}</style>
      <div className="cp">
        <div className="cp-bg"/>
        <div className="cp-card">
          <div className="cp-seal">🏆</div>
          <div className="cp-pre">Jornada concluída</div>
          <div className="cp-title">{book.title}</div>
          <div className="cp-sub">Você dominou todos os desafios de <em style={{color:'#9a9188'}}>{book.characterName}</em> e completou este capítulo do seu aprendizado.</div>
          <div className="cp-xp">{xp}</div>
          <div className="cp-xp-lbl">XP total acumulado</div>
          <button className="cp-btn" onClick={()=>navigate('/dashboard')}>Voltar à biblioteca</button>
        </div>
      </div>
    </>
  )

  const scene = book.nodes[nodeIndex]
  const total = book.nodes.length
  const progress = Math.round(((nodeIndex+1)/total)*100)
  const status = result?.status?.toLowerCase()
  const isCorrect = ['correto','correct'].includes(status)
  const isPartial = ['parcial','partial'].includes(status)
  const isWrong = result && !isCorrect && !isPartial

  const win=3, start=Math.max(0,nodeIndex-win), end=Math.min(total-1,nodeIndex+win)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Outfit:wght@300;400;500;600&family=Geist+Mono:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        @keyframes ldot{0%,80%,100%{transform:scale(.6);opacity:.3}40%{transform:scale(1);opacity:1}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes xpPop{0%{opacity:0;transform:translateY(0) scale(.8)}20%{opacity:1;transform:translateY(-8px) scale(1)}80%{opacity:1;transform:translateY(-16px)}100%{opacity:0;transform:translateY(-28px)}}
        @keyframes resultIn{from{opacity:0;transform:translateY(10px) scale(.99)}to{opacity:1;transform:none}}
        @keyframes charIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:none}}

        .r-root{min-height:100dvh;background:#0e0c0a;font-family:'Outfit',sans-serif;color:#9a9188;}

        /* TOPBAR */
        .r-top{display:flex;align-items:center;gap:16px;padding:0 48px;height:56px;border-bottom:1px solid #1e1a16;position:sticky;top:0;background:rgba(14,12,10,.96);backdrop-filter:blur(20px);z-index:20;}
        .r-back{display:flex;align-items:center;gap:6px;background:none;border:none;color:#3a3028;font-size:12px;cursor:pointer;font-family:'Outfit',sans-serif;padding:0;transition:color .2s;white-space:nowrap;}
        .r-back:hover{color:#9a9188;}
        .r-prog-wrap{flex:1;}
        .r-prog-head{display:flex;justify-content:space-between;margin-bottom:6px;}
        .r-prog-title{font-size:12px;color:#f5ede0;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:320px;font-family:'Playfair Display',serif;}
        .r-prog-info{font-family:'Geist Mono',monospace;font-size:11px;color:#3a3028;}
        .r-prog-track{height:1.5px;background:#1e1a16;border-radius:1px;overflow:hidden;}
        .r-prog-fill{height:100%;background:linear-gradient(90deg,#8b5e2a,#c4944a);border-radius:1px;transition:width .6s cubic-bezier(.4,0,.2,1);}
        .r-xp-wrap{position:relative;}
        .r-xp{font-family:'Geist Mono',monospace;font-size:12px;color:#5a5248;border:1px solid #2a2520;padding:5px 12px;border-radius:20px;transition:all .3s;}
        .r-xp.flash{color:#c4944a;border-color:#c4944a40;}
        .r-xp-pop{position:absolute;top:-2px;right:0;font-family:'Geist Mono',monospace;font-size:11px;font-weight:600;color:#c4944a;animation:xpPop 2s forwards;pointer-events:none;white-space:nowrap;}

        /* BODY */
        .r-body{max-width:700px;margin:0 auto;padding:52px 48px 120px;}

        /* MAP */
        .r-map{display:flex;align-items:center;gap:5px;margin-bottom:52px;animation:fadeIn .5s ease;}
        .r-mdot{width:24px;height:24px;border-radius:50%;border:1px solid #2a2520;display:flex;align-items:center;justify-content:center;font-family:'Geist Mono',monospace;font-size:9px;color:#2a2520;flex-shrink:0;transition:all .35s cubic-bezier(.4,0,.2,1);}
        .r-mdot.done{background:#1a1714;border-color:#2a2520;color:#3a3028;}
        .r-mdot.current{background:#c4944a;border-color:#c4944a;color:#0e0c0a;box-shadow:0 0 0 4px rgba(196,148,74,.15);}
        .r-mline{flex:1;height:1px;background:#1e1a16;transition:background .35s;max-width:24px;}
        .r-mline.done{background:#2a2520;}
        .r-mellipsis{font-family:'Geist Mono',monospace;font-size:10px;color:#2a2520;padding:0 3px;}

        /* SCENE */
        .r-scene{animation:slideUp .45s cubic-bezier(.4,0,.2,1);}
        .r-chapter-tag{display:inline-flex;align-items:center;gap:7px;font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:#5a5248;margin-bottom:10px;font-weight:500;}
        .r-chapter-dot{width:4px;height:4px;border-radius:50%;background:#c4944a;}
        .r-title{font-family:'Playfair Display',Georgia,serif;font-size:clamp(24px,3vw,34px);font-weight:700;color:#f5ede0;letter-spacing:-.01em;line-height:1.2;margin-bottom:40px;}

        /* PERSONAGEM */
        .r-char{display:flex;gap:16px;align-items:flex-start;margin-bottom:40px;animation:charIn .5s .1s cubic-bezier(.4,0,.2,1) both;}
        .r-char-avatar{width:46px;height:46px;border-radius:50%;border:1px solid #2a2520;background:#12100e;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:22px;position:relative;}
        .r-char-avatar::after{content:'';position:absolute;inset:-3px;border-radius:50%;border:1px solid #c4944a;opacity:.2;}
        .r-char-bubble{flex:1;background:#12100e;border:1px solid #2a2520;border-radius:0 16px 16px 16px;padding:20px 22px;position:relative;}
        .r-char-bubble::before{content:'';position:absolute;left:-7px;top:16px;width:6px;height:6px;background:#12100e;border-left:1px solid #2a2520;border-bottom:1px solid #2a2520;transform:rotate(45deg);}
        .r-char-name{font-size:10px;font-weight:600;color:#5a5248;text-transform:uppercase;letter-spacing:.1em;margin-bottom:10px;}
        .r-char-text{font-size:15px;line-height:1.9;color:#6a6258;font-style:italic;}

        /* DIVISOR */
        .r-divider{height:1px;background:linear-gradient(90deg,transparent,#2a2520 30%,#2a2520 70%,transparent);margin:36px 0;}

        /* DESAFIO */
        .r-challenge{border:1px solid #2a2520;border-radius:14px;padding:24px;margin-bottom:22px;animation:fadeUp .4s .15s cubic-bezier(.4,0,.2,1) both;position:relative;overflow:hidden;background:#12100e;}
        .r-challenge::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,#c4944a,transparent);opacity:.5;}
        .r-challenge-label{display:flex;align-items:center;gap:7px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.1em;color:#5a5248;margin-bottom:14px;}
        .r-challenge-pulse{width:5px;height:5px;border-radius:50%;background:#c4944a;animation:ldot 2s infinite;}
        .r-challenge-q{font-size:15px;color:#e8ddd0;line-height:1.75;}

        /* FORM */
        .r-form{display:flex;flex-direction:column;gap:10px;animation:fadeUp .4s .2s cubic-bezier(.4,0,.2,1) both;}
        .r-textarea{width:100%;padding:16px;background:#12100e;border:1px solid #2a2520;border-radius:12px;font-size:14px;color:#f5ede0;font-family:'Outfit',sans-serif;resize:vertical;min-height:110px;outline:none;transition:border-color .2s,background .2s;line-height:1.75;}
        .r-textarea:focus{border-color:#3a3028;background:#141210;}
        .r-textarea::placeholder{color:#2a2520;}
        .r-submit{padding:14px;background:#c4944a;color:#0e0c0a;border:none;border-radius:12px;font-size:14px;font-weight:600;cursor:pointer;font-family:'Outfit',sans-serif;transition:opacity .2s,transform .15s;letter-spacing:-.01em;}
        .r-submit:hover:not(:disabled){opacity:.88;transform:translateY(-1px);}
        .r-submit:active:not(:disabled){transform:scale(.98) translateY(0);}
        .r-submit:disabled{opacity:.2;cursor:not-allowed;}
        .r-hint{text-align:center;font-size:11px;color:#2a2520;}
        .r-loading-bar{height:2px;border-radius:1px;background:linear-gradient(90deg,transparent,#c4944a,transparent);background-size:200% 100%;animation:shimmer 1.2s infinite;}

        /* RESULTADO */
        .r-result{margin-top:16px;padding:22px 24px;border-radius:14px;border-width:1px;border-style:solid;animation:resultIn .35s cubic-bezier(.4,0,.2,1);}
        .r-result-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
        .r-result-badge{display:flex;align-items:center;gap:8px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;}
        .r-result-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;}
        .r-result-xp{font-family:'Geist Mono',monospace;font-size:12px;font-weight:600;}
        .r-result-text{font-size:14px;line-height:1.8;color:#6a6258;}
        .r-result-div{height:1px;background:#1e1a16;margin:16px 0;}
        .r-result-sub{font-size:13px;color:#5a5248;margin-bottom:14px;line-height:1.6;}
        .r-action{width:100%;padding:12px;border-radius:10px;border:1px solid #2a2520;background:transparent;font-size:13px;font-weight:500;cursor:pointer;font-family:'Outfit',sans-serif;color:#9a9188;transition:all .2s;}
        .r-action:hover{background:#1a1714;color:#f5ede0;border-color:#3a3028;}

        @media(max-width:767px){
          .r-top,.r-body{padding-left:20px;padding-right:20px;}
          .r-body{padding-top:36px;}
        }
      `}</style>

      <div className="r-root">
        <div className="r-top">
          <button className="r-back" onClick={()=>navigate('/dashboard')}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Biblioteca
          </button>
          <div className="r-prog-wrap">
            <div className="r-prog-head">
              <span className="r-prog-title">{book.title}</span>
              <span className="r-prog-info">{nodeIndex+1} / {total}</span>
            </div>
            <div className="r-prog-track"><div className="r-prog-fill" style={{width:`${progress}%`}}/></div>
          </div>
          <div className="r-xp-wrap">
            <div className={`r-xp ${xpFlash?'flash':''}`}>{xp} XP</div>
            {xpFlash && <div className="r-xp-pop">{xpFlash}</div>}
          </div>
        </div>

        <div className="r-body">
          {/* Mapa */}
          <div className="r-map">
            {start>0 && <span className="r-mellipsis">1…{start}</span>}
            {Array.from({length:end-start+1},(_,i)=>start+i).map(i=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:5}}>
                <div className={`r-mdot ${i<nodeIndex?'done':i===nodeIndex?'current':''}`}>{i+1}</div>
                {i<end && <div className={`r-mline ${i<nodeIndex?'done':''}`}/>}
              </div>
            ))}
            {end<total-1 && <span className="r-mellipsis">{end+2}…{total}</span>}
            <span style={{marginLeft:'auto',fontFamily:"'Geist Mono',monospace",fontSize:11,color:'#2a2520'}}>{progress}%</span>
          </div>

          {/* Cena */}
          <div className="r-scene" key={sceneKey}>
            <div className="r-chapter-tag">
              <div className="r-chapter-dot"/>
              {book.subject} · Cena {nodeIndex+1}
            </div>
            <h1 className="r-title">{scene.title}</h1>

            <div className="r-char">
              <div className="r-char-avatar">🧙</div>
              <div className="r-char-bubble">
                <div className="r-char-name">{book.characterName}</div>
                <div className="r-char-text">{scene.storyText}</div>
              </div>
            </div>

            <div className="r-divider"/>

            <div className="r-challenge">
              <div className="r-challenge-label">
                <div className="r-challenge-pulse"/>
                Desafio
              </div>
              <div className="r-challenge-q">{scene.challengeQuestion}</div>
            </div>

            {!result ? (
              <div className="r-form" key={`form-${sceneKey}`}>
                {loading && <div className="r-loading-bar"/>}
                <textarea
                  ref={textareaRef}
                  className="r-textarea"
                  placeholder="Escreva sua resposta aqui..."
                  value={answer}
                  onChange={e=>setAnswer(e.target.value)}
                  onKeyDown={e=>{if(e.key==='Enter'&&e.ctrlKey)handleEvaluate(e)}}
                  disabled={loading}
                />
                <button className="r-submit" onClick={handleEvaluate} disabled={loading||!answer.trim()}>
                  {loading?'Avaliando...':'Enviar resposta'}
                </button>
                <div className="r-hint">Ctrl + Enter para enviar</div>
              </div>
            ) : (() => {
              const cfg = isCorrect
                ? {border:'#6b4a1a',bg:'rgba(196,148,74,.05)',dot:'#c4944a',label:'Correto',xpLabel:'+100 XP'}
                : isPartial
                ? {border:'#4a3a1a',bg:'rgba(245,158,11,.04)',dot:'#f59e0b',label:'Parcial',xpLabel:'+50 XP'}
                : {border:'#2a2520',bg:'transparent',dot:'#3a3028',label:'Incorreto',xpLabel:''}
              return (
                <div className="r-result" style={{borderColor:cfg.border,background:cfg.bg}}>
                  <div className="r-result-head">
                    <div className="r-result-badge" style={{color:cfg.dot}}>
                      <div className="r-result-dot" style={{background:cfg.dot}}/>
                      {cfg.label}
                    </div>
                    {cfg.xpLabel && <span className="r-result-xp" style={{color:cfg.dot}}>{cfg.xpLabel}</span>}
                  </div>
                  <div className="r-result-text">{result.feedback}</div>
                  {(isCorrect||isPartial)&&(
                    <>
                      <div className="r-result-div"/>
                      <div className="r-result-sub">{nodeIndex===total-1?'Você completou este livro.':'Pronto para a próxima cena?'}</div>
                      <button className="r-action" onClick={goNext}>{nodeIndex===total-1?'Concluir jornada':'Próxima cena'} →</button>
                    </>
                  )}
                  {isWrong&&(
                    <>
                      <div className="r-result-div"/>
                      <div className="r-result-sub">Releia o enunciado e tente uma abordagem diferente.</div>
                      <button className="r-action" onClick={()=>{setResult(null);setAnswer('')}}>Tentar novamente</button>
                    </>
                  )}
                </div>
              )
            })()}
          </div>
        </div>
      </div>
    </>
  )
}
