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
    const fetchBook = async () => {
      const { ok, data } = await api.books.get(id)
      if (!ok) { navigate('/dashboard'); return }
      if (!data.nodes || data.nodes.length === 0) {
        navigate('/dashboard'); return
      }
      setBook(data)
    }
    fetchBook()
  }, [id, navigate])

  const handleEvaluate = async (e) => {
    e.preventDefault()
    if (!answer.trim()) return
    setLoading(true)
    setResult(null)

    const scene = book.nodes[nodeIndex]
    const { ok, data } = await api.evaluate(scene.challengeQuestion, answer)

    if (ok) {
      setResult(data)
      const isCorrect = data.status === 'correto' || data.status === 'correct'
      const isPartial = data.status === 'parcial' || data.status === 'partial'
      if (isCorrect || isPartial) {
        const res = await api.user.progress({
          bookId: id,
          nodeId: scene.id,
          currentNode: scene.id,
          isCorrect,
          status: data.status,
        })
        if (res.ok) {
          setXp(res.data.xpTotal)
          const stored = JSON.parse(localStorage.getItem('user') || '{}')
          localStorage.setItem('user', JSON.stringify({ ...stored, xp: res.data.xpTotal }))
        }
      }
    } else {
      setResult({ status: 'erro', feedback: 'Não foi possível conectar à IA. Tente novamente.' })
    }
    setLoading(false)
  }

  const goNext = () => {
    if (nodeIndex < book.nodes.length - 1) {
      setNodeIndex(i => i + 1)
      setAnswer('')
      setResult(null)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      setCompleted(true)
    }
  }

  if (!book) return (
    <div style={{ minHeight: '100vh', background: '#0d0f14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: '#4a4d60', fontFamily: 'DM Sans, sans-serif' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>📖</div>
        <p>Carregando livro...</p>
      </div>
    </div>
  )

  if (completed) return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,600&family=DM+Sans:wght@400;500&display=swap');
        @keyframes scaleIn { from{opacity:0;transform:scale(0.85)} to{opacity:1;transform:scale(1)} }
        .comp-root { min-height:100vh; background:#0d0f14; display:flex; align-items:center; justify-content:center; font-family:'DM Sans',sans-serif; }
        .comp-card { background:#13151c; border:1px solid #2a2d3a; border-radius:24px; padding:56px 48px; text-align:center; max-width:440px; animation:scaleIn 0.4s ease; }
        .comp-trophy { font-size:56px; margin-bottom:20px; }
        .comp-title { font-family:'Lora',serif; font-size:26px; color:#f1f0ff; margin:0 0 10px; }
        .comp-sub { font-size:14px; color:#666980; line-height:1.6; margin:0 0 28px; }
        .comp-xp { display:inline-block; padding:8px 20px; background:rgba(99,102,241,0.15); border:1px solid rgba(99,102,241,0.3); border-radius:20px; color:#a5b4fc; font-size:14px; font-weight:500; margin-bottom:28px; }
        .comp-btn { display:block; width:100%; padding:13px; background:linear-gradient(135deg,#7c3aed,#6366f1); color:white; border:none; border-radius:10px; font-size:14px; font-weight:500; cursor:pointer; font-family:'DM Sans',sans-serif; }
        .comp-btn:hover { opacity:0.9; }
      `}</style>
      <div className="comp-root">
        <div className="comp-card">
          <div className="comp-trophy">🏆</div>
          <h2 className="comp-title">Jornada concluída!</h2>
          <p className="comp-sub">Você completou <strong style={{color:'#f1f0ff'}}>{book.title}</strong> e dominou todos os desafios do {book.characterName}.</p>
          <div className="comp-xp">⚡ {xp} XP acumulados</div>
          <button className="comp-btn" onClick={() => navigate('/dashboard')}>Voltar à estante</button>
        </div>
      </div>
    </>
  )

  const scene = book.nodes[nodeIndex]
  const isCorrect = result && (result.status === 'correto' || result.status === 'correct')
  const isPartial = result && (result.status === 'parcial' || result.status === 'partial')
  const isWrong = result && !isCorrect && !isPartial
  const progress = Math.round(((nodeIndex + 1) / book.nodes.length) * 100)
  const isLast = nodeIndex === book.nodes.length - 1

  const resultCfg = isCorrect
    ? { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)', label: '✦ Correto!', labelColor: '#6ee7b7', divColor: 'rgba(16,185,129,0.2)' }
    : isPartial
    ? { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', label: '◈ Quase lá', labelColor: '#fcd34d', divColor: 'rgba(245,158,11,0.2)' }
    : { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', label: '✕ Tente novamente', labelColor: '#f87171', divColor: 'rgba(239,68,68,0.2)' }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
        * { box-sizing: border-box; }
        .read-root { min-height:100vh; background:#0d0f14; font-family:'DM Sans',sans-serif; color:#c9c8d6; }

        .read-topbar {
          display:flex; align-items:center; gap:16px;
          padding:14px 40px; border-bottom:1px solid #1e2030;
          position:sticky; top:0; background:rgba(13,15,20,0.92);
          backdrop-filter:blur(12px); z-index:10;
        }
        .read-back { background:none; border:none; color:#666980; font-size:13px; cursor:pointer; font-family:'DM Sans',sans-serif; display:flex; align-items:center; gap:5px; white-space:nowrap; transition:color 0.2s; padding:0; }
        .read-back:hover { color:#c9c8d6; }
        .read-bar-wrap { flex:1; }
        .read-bar-labels { display:flex; justify-content:space-between; margin-bottom:5px; }
        .read-bar-title { font-size:12px; color:#f1f0ff; font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:280px; }
        .read-bar-info { font-size:11px; color:#4a4d60; }
        .read-bar-track { height:3px; background:#1e2030; border-radius:2px; }
        .read-bar-fill { height:100%; background:linear-gradient(90deg,#6366f1,#a78bfa); border-radius:2px; transition:width 0.5s; }
        .read-xp { font-size:12px; color:#a78bfa; white-space:nowrap; background:#1a1c28; border:1px solid #2a2d3a; padding:5px 12px; border-radius:20px; }

        .read-body { max-width:680px; margin:0 auto; padding:48px 40px 80px; }

        .read-map { display:flex; align-items:center; gap:4px; margin-bottom:40px; }
        .m-dot { width:20px; height:20px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:500; border:1.5px solid #2a2d3a; color:#4a4d60; flex-shrink:0; transition:all 0.3s; }
        .m-dot.done { background:rgba(99,102,241,0.2); border-color:#6366f1; color:#a5b4fc; }
        .m-dot.current { background:#6366f1; border-color:#6366f1; color:white; }
        .m-line { flex:1; height:1px; background:#1e2030; transition:background 0.3s; max-width:28px; }
        .m-line.done { background:#6366f1; }

        .read-scene-meta { font-size:11px; text-transform:uppercase; letter-spacing:0.1em; color:#4a4d60; margin-bottom:6px; }
        .read-title { font-family:'Lora',serif; font-size:26px; font-weight:600; color:#f1f0ff; margin:0 0 30px; line-height:1.3; animation:fadeUp 0.35s ease; }

        .read-char { display:flex; gap:14px; align-items:flex-start; margin-bottom:32px; animation:fadeUp 0.35s 0.05s ease both; }
        .read-avatar { width:42px; height:42px; border-radius:50%; background:linear-gradient(135deg,#6366f1,#8b5cf6); display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
        .read-bubble { flex:1; background:#13151c; border:1px solid #1e2030; border-radius:0 14px 14px 14px; padding:16px 18px; }
        .read-char-name { font-size:10px; font-weight:500; color:#6366f1; text-transform:uppercase; letter-spacing:0.06em; margin-bottom:7px; }
        .read-char-text { font-size:14px; line-height:1.85; color:#9ca3b0; font-style:italic; }

        .read-divider { height:1px; background:#1e2030; margin:28px 0; }

        .read-challenge { background:#13151c; border:1px solid #2a2d3a; border-radius:14px; padding:22px; margin-bottom:22px; animation:fadeUp 0.35s 0.1s ease both; }
        .read-challenge-top { font-size:10px; text-transform:uppercase; letter-spacing:0.08em; color:#f59e0b; font-weight:500; margin-bottom:10px; }
        .read-challenge-q { font-size:15px; color:#e2e0f0; line-height:1.65; }

        .read-form { display:flex; flex-direction:column; gap:10px; animation:fadeUp 0.35s 0.15s ease both; }
        .read-textarea { width:100%; padding:13px 16px; background:#0d0f14; border:1px solid #2a2d3a; border-radius:12px; font-size:14px; color:#f1f0ff; font-family:'DM Sans',sans-serif; resize:vertical; min-height:96px; outline:none; transition:border-color 0.2s; line-height:1.6; }
        .read-textarea:focus { border-color:#6366f1; }
        .read-textarea::placeholder { color:#3d4060; }
        .read-submit { padding:13px; background:linear-gradient(135deg,#7c3aed,#6366f1); color:white; border:none; border-radius:10px; font-size:14px; font-weight:500; cursor:pointer; font-family:'DM Sans',sans-serif; transition:opacity 0.2s; }
        .read-submit:disabled { opacity:0.45; cursor:not-allowed; }
        .read-submit:hover:not(:disabled) { opacity:0.88; }

        .read-result { margin-top:18px; padding:18px; border-radius:12px; border-width:1px; border-style:solid; animation:fadeUp 0.3s ease; }
        .read-result-label { font-size:11px; text-transform:uppercase; letter-spacing:0.08em; font-weight:500; margin-bottom:8px; }
        .read-result-text { font-size:14px; line-height:1.7; }
        .read-result-div { height:1px; margin:12px 0; }
        .read-result-sub { font-size:13px; font-style:italic; opacity:0.75; line-height:1.6; }
        .read-action-btn { margin-top:14px; width:100%; padding:11px; border-radius:10px; font-size:13px; font-weight:500; cursor:pointer; font-family:'DM Sans',sans-serif; transition:opacity 0.2s; border-width:1px; border-style:solid; }
        .read-action-btn:hover { opacity:0.85; }
      `}</style>

      <div className="read-root">
        <div className="read-topbar">
          <button className="read-back" onClick={() => navigate('/dashboard')}>← Estante</button>
          <div className="read-bar-wrap">
            <div className="read-bar-labels">
              <span className="read-bar-title">{book.title}</span>
              <span className="read-bar-info">Cena {nodeIndex + 1}/{book.nodes.length} · {progress}%</span>
            </div>
            <div className="read-bar-track">
              <div className="read-bar-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <div className="read-xp">⚡ {xp} XP</div>
        </div>

        <div className="read-body">
          {/* Mapa — janela de 7 nós ao redor do atual */}
          {(() => {
            const total = book.nodes.length
            const window = 3 // nós antes e depois do atual
            const start = Math.max(0, nodeIndex - window)
            const end = Math.min(total - 1, nodeIndex + window)
            const dots = []
            if (start > 0) dots.push({ type: 'ellipsis', key: 'el-start', label: `1…${start}` })
            for (let i = start; i <= end; i++) dots.push({ type: 'dot', index: i, key: i })
            if (end < total - 1) dots.push({ type: 'ellipsis', key: 'el-end', label: `${end + 2}…${total}` })
            return (
              <div className="read-map">
                {dots.map(d => d.type === 'ellipsis'
                  ? <span key={d.key} style={{ fontSize: 10, color: '#4a4d60', padding: '0 4px', whiteSpace: 'nowrap' }}>{d.label}</span>
                  : (
                    <div key={d.key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div className={`m-dot ${d.index < nodeIndex ? 'done' : d.index === nodeIndex ? 'current' : ''}`}>{d.index + 1}</div>
                      {d.index < end && <div className={`m-line ${d.index < nodeIndex ? 'done' : ''}`} />}
                    </div>
                  )
                )}
                <span style={{ marginLeft: 'auto', fontSize: 11, color: '#4a4d60', whiteSpace: 'nowrap' }}>{nodeIndex + 1} / {total}</span>
              </div>
            )
          })()}

          <div className="read-scene-meta">{book.subject} · {scene.title}</div>
          <h1 className="read-title">{scene.title}</h1>

          <div className="read-char">
            <div className="read-avatar">🧙</div>
            <div className="read-bubble">
              <div className="read-char-name">{book.characterName}</div>
              <div className="read-char-text">{scene.storyText}</div>
            </div>
          </div>

          <div className="read-divider" />

          <div className="read-challenge">
            <div className="read-challenge-top">⚔ Desafio</div>
            <div className="read-challenge-q">{scene.challengeQuestion}</div>
          </div>

          {!result ? (
            <form className="read-form" onSubmit={handleEvaluate}>
              <textarea
                className="read-textarea"
                placeholder="Escreva sua resposta aqui..."
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                required
              />
              <button className="read-submit" type="submit" disabled={loading}>
                {loading ? '🤖 O mentor está avaliando...' : 'Enviar resposta'}
              </button>
            </form>
          ) : (
            <div className="read-result" style={{ background: resultCfg.bg, borderColor: resultCfg.border }}>
              <div className="read-result-label" style={{ color: resultCfg.labelColor }}>{resultCfg.label}</div>
              <div className="read-result-text">{result.feedback}</div>

              {(isCorrect || isPartial) && (
                <>
                  <div className="read-result-div" style={{ background: resultCfg.divColor }} />
                  <div className="read-result-sub">
                    {isCorrect ? '+100 XP conquistados! ' : '+50 XP pelo esforço! '}
                    {isLast ? 'Você chegou ao fim desta jornada.' : 'Avance para a próxima cena.'}
                  </div>
                  <button
                    className="read-action-btn"
                    style={{ background: resultCfg.bg, borderColor: resultCfg.border, color: resultCfg.labelColor }}
                    onClick={goNext}
                  >
                    {isLast ? 'Concluir jornada 🏆' : 'Próxima cena →'}
                  </button>
                </>
              )}

              {isWrong && (
                <>
                  <div className="read-result-div" style={{ background: resultCfg.divColor }} />
                  <div className="read-result-sub">Releia o pergaminho e tente uma explicação diferente.</div>
                  <button
                    className="read-action-btn"
                    style={{ background: 'rgba(99,102,241,0.1)', borderColor: 'rgba(99,102,241,0.3)', color: '#a5b4fc' }}
                    onClick={() => { setResult(null); setAnswer('') }}
                  >
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
