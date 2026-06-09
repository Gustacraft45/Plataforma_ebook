import { useEffect, useState } from 'react'
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
  const [xp, setXp] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user'))?.xp || 0 } catch { return 0 }
  })

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
    const { ok, data } = await api.evaluate(scene.challengeQuestion, answer, scene.expectedAnswer || '')
    if (ok) {
      setResult(data)
      const isCorrect = ['correto','correct'].includes(data.status?.toLowerCase())
      const isPartial = ['parcial','partial'].includes(data.status?.toLowerCase())
      if (isCorrect || isPartial) {
        const res = await api.user.progress({ bookId: id, nodeId: scene.id, currentNode: scene.id, isCorrect, status: data.status })
        if (res.ok) {
          setXp(res.data.xpTotal)
          const u = JSON.parse(localStorage.getItem('user') || '{}')
          localStorage.setItem('user', JSON.stringify({ ...u, xp: res.data.xpTotal }))
        }
      }
    } else {
      setResult({ status: 'errado', feedback: 'Não foi possível conectar à IA. Tente novamente.' })
    }
    setLoading(false)
  }

  const goNext = () => {
    if (nodeIndex < book.nodes.length - 1) {
      setNodeIndex(i => i + 1); setAnswer(''); setResult(null)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      setCompleted(true)
    }
  }

  if (!book) return (
    <div style={{ minHeight:'100dvh', background:'#09090b', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Outfit',sans-serif", color:'#27272a', fontSize:14 }}>
      Carregando...
    </div>
  )

  if (completed) return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600&family=Geist+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes scaleIn{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}
        .cp-root{min-height:100dvh;background:#09090b;display:flex;align-items:center;justify-content:center;font-family:'Outfit',sans-serif;}
        .cp-card{border:1px solid #1c1c1e;border-radius:20px;padding:56px 48px;text-align:center;max-width:420px;animation:scaleIn .4s ease;background:#111113;}
        .cp-icon{width:56px;height:56px;border:1px solid #27272a;border-radius:16px;display:flex;align-items:center;justify-content:center;margin:0 auto 24px;}
        .cp-title{font-size:22px;font-weight:600;color:#fafafa;letter-spacing:-.02em;margin-bottom:8px;}
        .cp-sub{font-size:14px;color:#52525b;line-height:1.7;margin-bottom:28px;}
        .cp-xp{font-family:'Geist Mono',monospace;font-size:28px;font-weight:500;color:#fafafa;letter-spacing:-.02em;margin-bottom:28px;}
        .cp-xp span{font-size:13px;color:#3f3f46;margin-left:4px;font-family:'Outfit',sans-serif;}
        .cp-btn{display:block;width:100%;padding:13px;background:#fafafa;color:#09090b;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;font-family:'Outfit',sans-serif;transition:opacity .18s;}
        .cp-btn:hover{opacity:.88;}
      `}</style>
      <div className="cp-root">
        <div className="cp-card">
          <div className="cp-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M5 12l5 5L19 7" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="cp-title">Jornada concluída.</div>
          <div className="cp-sub">Você completou <strong style={{ color:'#a1a1aa' }}>{book.title}</strong> e dominou todos os desafios.</div>
          <div className="cp-xp">{xp}<span>XP acumulados</span></div>
          <button className="cp-btn" onClick={() => navigate('/dashboard')}>Voltar à biblioteca</button>
        </div>
      </div>
    </>
  )

  const scene = book.nodes[nodeIndex]
  const total = book.nodes.length
  const progress = Math.round(((nodeIndex + 1) / total) * 100)
  const status = result?.status?.toLowerCase()
  const isCorrect = ['correto','correct'].includes(status)
  const isPartial = ['parcial','partial'].includes(status)
  const isWrong = result && !isCorrect && !isPartial

  // mapa janela deslizante
  const win = 3
  const start = Math.max(0, nodeIndex - win)
  const end = Math.min(total - 1, nodeIndex + win)

  const resultCfg = isCorrect
    ? { border:'#10b981', bg:'rgba(16,185,129,.04)', label:'Correto', color:'#10b981', xpLabel:'+100 XP' }
    : isPartial
    ? { border:'#f59e0b', bg:'rgba(245,158,11,.04)', label:'Parcial', color:'#f59e0b', xpLabel:'+50 XP' }
    : { border:'#27272a', bg:'transparent', label:'Incorreto', color:'#52525b', xpLabel:'' }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&family=Geist+Mono:wght@400;500&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        .r-root { min-height:100dvh; background:#09090b; font-family:'Outfit',sans-serif; color:#a1a1aa; }

        /* TOPBAR */
        .r-top { display:flex; align-items:center; gap:16px; padding:0 40px; height:52px; border-bottom:1px solid #1c1c1e; position:sticky; top:0; background:rgba(9,9,11,.92); backdrop-filter:blur(16px); z-index:20; }
        .r-back { display:flex; align-items:center; gap:6px; background:none; border:none; color:#52525b; font-size:12px; cursor:pointer; font-family:'Outfit',sans-serif; padding:0; transition:color .18s; white-space:nowrap; }
        .r-back:hover { color:#a1a1aa; }
        .r-progress-wrap { flex:1; }
        .r-prog-labels { display:flex; justify-content:space-between; margin-bottom:5px; }
        .r-prog-title { font-size:12px; color:#fafafa; font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:340px; }
        .r-prog-info { font-size:11px; color:'#3f3f46'; font-family:'Geist Mono',monospace; }
        .r-prog-track { height:2px; background:#1c1c1e; border-radius:1px; }
        .r-prog-fill { height:100%; background:#3b82f6; border-radius:1px; transition:width .5s; }
        .r-xp { font-family:'Geist Mono',monospace; font-size:12px; color:#52525b; white-space:nowrap; border:1px solid #1c1c1e; padding:5px 12px; border-radius:20px; }

        /* BODY */
        .r-body { max-width:680px; margin:0 auto; padding:52px 40px 100px; }

        /* MAP */
        .r-map { display:flex; align-items:center; gap:6px; margin-bottom:44px; }
        .r-mdot { width:22px; height:22px; border-radius:50%; border:1px solid #1c1c1e; display:flex; align-items:center; justify-content:center; font-family:'Geist Mono',monospace; font-size:9px; color:#27272a; flex-shrink:0; transition:all .25s; }
        .r-mdot.done { background:#1c1c1e; border-color:#27272a; color:#52525b; }
        .r-mdot.current { background:#3b82f6; border-color:#3b82f6; color:#fff; }
        .r-mline { flex:1; height:1px; background:#1c1c1e; transition:background .25s; max-width:28px; }
        .r-mline.done { background:#27272a; }
        .r-mellipsis { font-size:10px; color:'#27272a'; padding:0 2px; font-family:'Geist Mono',monospace; color:#27272a; }

        /* SCENE */
        .r-meta { font-size:11px; text-transform:uppercase; letter-spacing:.08em; color:#3f3f46; margin-bottom:8px; }
        .r-title { font-size:clamp(22px,3vw,28px); font-weight:600; color:#fafafa; letter-spacing:-.02em; line-height:1.2; margin-bottom:36px; animation:fadeUp .3s ease; }

        /* CHARACTER */
        .r-char { display:flex; gap:14px; align-items:flex-start; margin-bottom:36px; animation:fadeUp .3s .05s ease both; }
        .r-char-avatar { width:40px; height:40px; border-radius:50%; border:1px solid #27272a; background:#111113; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .r-char-bubble { flex:1; background:#111113; border:1px solid #1c1c1e; border-radius:0 12px 12px 12px; padding:18px 20px; }
        .r-char-name { font-size:10px; font-weight:600; color:#3f3f46; text-transform:uppercase; letter-spacing:.08em; margin-bottom:10px; }
        .r-char-text { font-size:14px; line-height:1.85; color:#71717a; }

        .r-divider { height:1px; background:#1c1c1e; margin:32px 0; }

        /* CHALLENGE */
        .r-challenge { border:1px solid #1c1c1e; border-radius:12px; padding:20px; margin-bottom:20px; animation:fadeUp .3s .1s ease both; }
        .r-challenge-top { font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:.08em; color:#3f3f46; margin-bottom:10px; }
        .r-challenge-q { font-size:15px; color:#e4e4e7; line-height:1.65; }

        /* FORM */
        .r-form { display:flex; flex-direction:column; gap:10px; animation:fadeUp .3s .15s ease both; }
        .r-textarea { width:100%; padding:14px; background:#111113; border:1px solid #1c1c1e; border-radius:10px; font-size:14px; color:#fafafa; font-family:'Outfit',sans-serif; resize:vertical; min-height:100px; outline:none; transition:border-color .18s; line-height:1.65; }
        .r-textarea:focus { border-color:#27272a; }
        .r-textarea::placeholder { color:#27272a; }
        .r-submit { padding:12px; background:#fafafa; color:#09090b; border:none; border-radius:10px; font-size:14px; font-weight:600; cursor:pointer; font-family:'Outfit',sans-serif; transition:opacity .18s, transform .1s; }
        .r-submit:hover:not(:disabled) { opacity:.88; transform:translateY(-1px); }
        .r-submit:active:not(:disabled) { transform:scale(.98); }
        .r-submit:disabled { opacity:.3; cursor:not-allowed; }

        /* RESULT */
        .r-result { margin-top:16px; padding:20px; border-radius:12px; border-width:1px; border-style:solid; animation:fadeUp .25s ease; }
        .r-result-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
        .r-result-label { font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:.08em; }
        .r-result-xp { font-family:'Geist Mono',monospace; font-size:11px; }
        .r-result-text { font-size:14px; line-height:1.7; color:#71717a; }
        .r-result-div { height:1px; background:#1c1c1e; margin:14px 0; }
        .r-result-sub { font-size:13px; color:#52525b; line-height:1.6; }
        .r-action { margin-top:14px; width:100%; padding:11px; border-radius:10px; border:1px solid #1c1c1e; background:transparent; font-size:13px; font-weight:500; cursor:pointer; font-family:'Outfit',sans-serif; color:#a1a1aa; transition:all .18s; }
        .r-action:hover { background:#1c1c1e; color:#fafafa; }

        @media(max-width:767px){
          .r-top{padding:0 20px;}
          .r-body{padding:32px 20px 80px;}
        }
      `}</style>

      <div className="r-root">
        <div className="r-top">
          <button className="r-back" onClick={() => navigate('/dashboard')}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Biblioteca
          </button>
          <div className="r-progress-wrap">
            <div className="r-prog-labels">
              <span className="r-prog-title">{book.title}</span>
              <span className="r-prog-info" style={{ fontFamily:"'Geist Mono',monospace", fontSize:11, color:'#3f3f46' }}>{nodeIndex+1}/{total}</span>
            </div>
            <div className="r-prog-track"><div className="r-prog-fill" style={{ width:`${progress}%` }} /></div>
          </div>
          <div className="r-xp">{xp} XP</div>
        </div>

        <div className="r-body">
          {/* Mapa */}
          <div className="r-map">
            {start > 0 && <span className="r-mellipsis">1…{start}</span>}
            {Array.from({ length: end - start + 1 }, (_, i) => start + i).map((i, arrIdx) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:6 }}>
                <div className={`r-mdot ${i < nodeIndex ? 'done' : i === nodeIndex ? 'current' : ''}`}>{i+1}</div>
                {i < end && <div className={`r-mline ${i < nodeIndex ? 'done' : ''}`} />}
              </div>
            ))}
            {end < total - 1 && <span className="r-mellipsis">{end+2}…{total}</span>}
            <span style={{ marginLeft:'auto', fontFamily:"'Geist Mono',monospace", fontSize:11, color:'#27272a', whiteSpace:'nowrap' }}>{progress}%</span>
          </div>

          <div className="r-meta">{book.subject}</div>
          <h1 className="r-title">{scene.title}</h1>

          <div className="r-char">
            <div className="r-char-avatar">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="6" r="3" stroke="#3f3f46" strokeWidth="1.2"/>
                <path d="M3 15c0-3 2.7-5 6-5s6 2 6 5" stroke="#3f3f46" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="r-char-bubble">
              <div className="r-char-name">{book.characterName}</div>
              <div className="r-char-text">{scene.storyText}</div>
            </div>
          </div>

          <div className="r-divider" />

          <div className="r-challenge">
            <div className="r-challenge-top">Desafio</div>
            <div className="r-challenge-q">{scene.challengeQuestion}</div>
          </div>

          {!result ? (
            <form className="r-form" onSubmit={handleEvaluate}>
              <textarea
                className="r-textarea"
                placeholder="Escreva sua resposta..."
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                required
              />
              <button className="r-submit" type="submit" disabled={loading}>
                {loading ? 'Avaliando...' : 'Enviar resposta'}
              </button>
            </form>
          ) : (
            <div className="r-result" style={{ borderColor: resultCfg.border, background: resultCfg.bg }}>
              <div className="r-result-header">
                <span className="r-result-label" style={{ color: resultCfg.color }}>{resultCfg.label}</span>
                {resultCfg.xpLabel && <span className="r-result-xp" style={{ color: resultCfg.color }}>{resultCfg.xpLabel}</span>}
              </div>
              <div className="r-result-text">{result.feedback}</div>

              {(isCorrect || isPartial) && (
                <>
                  <div className="r-result-div" />
                  <div className="r-result-sub">
                    {nodeIndex === total - 1 ? 'Você completou este livro.' : 'Avance para a próxima cena.'}
                  </div>
                  <button className="r-action" onClick={goNext}>
                    {nodeIndex === total - 1 ? 'Concluir jornada' : 'Próxima cena'} →
                  </button>
                </>
              )}

              {isWrong && (
                <>
                  <div className="r-result-div" />
                  <div className="r-result-sub">Revise o conteúdo e tente uma resposta diferente.</div>
                  <button className="r-action" onClick={() => { setResult(null); setAnswer('') }}>
                    Tentar novamente
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
