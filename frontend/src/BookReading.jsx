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
  const [xp, setXp] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user'))?.xp || 0 } catch { return 0 }
  })

  useEffect(() => {
    const fetchBook = async () => {
      const { ok, data } = await api.books.get(id)
      if (!ok) { navigate('/dashboard'); return }
      setBook(data)
    }
    fetchBook()
  }, [id, navigate])

  const handleEvaluate = async (e) => {
    e.preventDefault()
    if (!answer.trim()) return
    setLoading(true)
    setResult(null)

    const currentScene = book.nodes[nodeIndex]
    const { ok, data } = await api.evaluate(currentScene.challengeQuestion, answer)

    if (ok) {
      setResult(data)
      const isCorrect = data.status === 'correto' || data.status === 'correct'
      const res = await api.user.progress(id, currentScene.id, isCorrect)
      if (res.ok) {
        setXp(res.data.xpTotal)
        const stored = JSON.parse(localStorage.getItem('user') || '{}')
        localStorage.setItem('user', JSON.stringify({ ...stored, xp: res.data.xpTotal }))
      }
    } else {
      setResult({ status: 'erro', feedback: 'Não foi possível conectar à IA.' })
    }
    setLoading(false)
  }

  const goNext = () => {
    if (nodeIndex < book.nodes.length - 1) {
      setNodeIndex(i => i + 1)
      setAnswer('')
      setResult(null)
    }
  }

  if (!book) return (
    <div style={{ minHeight: '100vh', background: '#0d0f14', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666980', fontFamily: 'DM Sans, sans-serif' }}>
      Carregando livro...
    </div>
  )

  const scene = book.nodes[nodeIndex]
  const isLast = nodeIndex === book.nodes.length - 1
  const isCorrect = result && (result.status === 'correto' || result.status === 'correct')
  const isPartial = result && (result.status === 'parcial' || result.status === 'partial')
  const progress = Math.round(((nodeIndex + 1) / book.nodes.length) * 100)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        .read-root { min-height: 100vh; background: #0d0f14; font-family: 'DM Sans', sans-serif; color: #c9c8d6; }

        .read-topbar { display: flex; align-items: center; justify-content: space-between; padding: 16px 40px; border-bottom: 1px solid #1e2030; }
        .read-back { background: none; border: none; color: #666980; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; display: flex; align-items: center; gap: 6px; transition: color 0.2s; }
        .read-back:hover { color: #c9c8d6; }
        .read-progress-wrap { flex: 1; max-width: 200px; margin: 0 24px; }
        .read-progress-track { height: 4px; background: #1e2030; border-radius: 2px; overflow: hidden; }
        .read-progress-fill { height: 100%; background: linear-gradient(90deg, #6366f1, #8b5cf6); border-radius: 2px; transition: width 0.5s; }
        .read-progress-label { font-size: 11px; color: #4a4d60; text-align: right; margin-top: 4px; }
        .read-xp { font-size: 13px; color: #a78bfa; background: #1a1c28; border: 1px solid #2a2d3a; padding: 5px 12px; border-radius: 20px; }

        .read-body { max-width: 720px; margin: 0 auto; padding: 50px 40px; }

        .read-scene-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #4a4d60; margin-bottom: 6px; }
        .read-title { font-family: 'Lora', serif; font-size: 28px; font-weight: 600; color: #f1f0ff; margin: 0 0 32px; line-height: 1.3; }

        .read-char-block { display: flex; gap: 16px; align-items: flex-start; margin-bottom: 36px; }
        .read-char-avatar { width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #8b5cf6); display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
        .read-char-bubble { flex: 1; background: #13151c; border: 1px solid #1e2030; border-radius: 0 14px 14px 14px; padding: 18px 20px; }
        .read-char-name { font-size: 11px; font-weight: 500; color: #6366f1; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px; }
        .read-char-text { font-size: 15px; line-height: 1.8; color: #9ca3b0; font-style: italic; }

        .read-divider { height: 1px; background: #1e2030; margin: 32px 0; }

        .read-challenge { background: #13151c; border: 1px solid #2a2d3a; border-radius: 14px; padding: 24px; margin-bottom: 24px; }
        .read-challenge-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #f59e0b; font-weight: 500; margin-bottom: 10px; display: flex; align-items: center; gap-gap: 6px; }
        .read-challenge-q { font-size: 15px; color: #e2e0f0; line-height: 1.6; font-weight: 400; }

        .read-form { display: flex; flex-direction: column; gap: 12px; }
        .read-textarea { width: 100%; padding: 14px 16px; background: #0d0f14; border: 1px solid #2a2d3a; border-radius: 12px; font-size: 14px; color: #f1f0ff; font-family: 'DM Sans', sans-serif; resize: vertical; min-height: 100px; outline: none; transition: border-color 0.2s; line-height: 1.6; }
        .read-textarea:focus { border-color: #6366f1; }
        .read-textarea::placeholder { color: #3d4060; }
        .read-submit { padding: 13px; background: linear-gradient(135deg, #7c3aed, #6366f1); color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: 500; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: opacity 0.2s; }
        .read-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        .read-submit:hover:not(:disabled) { opacity: 0.9; }

        .read-result { margin-top: 20px; padding: 20px; border-radius: 12px; border-width: 1px; border-style: solid; }
        .read-result-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 500; margin-bottom: 8px; }
        .read-result-text { font-size: 14px; line-height: 1.7; }
        .read-result-narrator { margin-top: 12px; padding-top: 12px; border-top-width: 1px; border-top-style: solid; font-size: 13px; line-height: 1.6; font-style: italic; opacity: 0.7; }

        .read-next { margin-top: 16px; width: 100%; padding: 12px; border-radius: 10px; border: 1px solid #10b981; background: rgba(16,185,129,0.1); color: #6ee7b7; font-size: 14px; font-weight: 500; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: background 0.2s; }
        .read-next:hover { background: rgba(16,185,129,0.2); }

        .read-map { display: flex; align-items: center; gap: 6px; margin-bottom: 40px; flex-wrap: wrap; }
        .map-dot { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 500; border: 1.5px solid #2a2d3a; color: #4a4d60; flex-shrink: 0; }
        .map-dot.done { background: rgba(99,102,241,0.15); border-color: #6366f1; color: #a5b4fc; }
        .map-dot.current { background: #6366f1; border-color: #6366f1; color: white; }
        .map-line { flex: 1; height: 1px; background: #1e2030; min-width: 10px; max-width: 30px; }
        .map-line.done { background: #6366f1; }
      `}</style>

      <div className="read-root">
        <div className="read-topbar">
          <button className="read-back" onClick={() => navigate('/dashboard')}>← Estante</button>
          <div className="read-progress-wrap">
            <div className="read-progress-track">
              <div className="read-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="read-progress-label">{nodeIndex + 1} / {book.nodes.length} cenas</div>
          </div>
          <div className="read-xp">⚡ {xp} XP</div>
        </div>

        <div className="read-body">
          {/* Mapa */}
          <div className="read-map">
            {book.nodes.map((n, i) => (
              <div key={n.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div className={`map-dot ${i < nodeIndex ? 'done' : i === nodeIndex ? 'current' : ''}`}>{i + 1}</div>
                {i < book.nodes.length - 1 && <div className={`map-line ${i < nodeIndex ? 'done' : ''}`} />}
              </div>
            ))}
          </div>

          <div className="read-scene-label">Cena {nodeIndex + 1} · {book.subject}</div>
          <h1 className="read-title">{scene.title}</h1>

          {/* Personagem */}
          <div className="read-char-block">
            <div className="read-char-avatar">🧙</div>
            <div className="read-char-bubble">
              <div className="read-char-name">{book.characterName}</div>
              <div className="read-char-text">{scene.storyText}</div>
            </div>
          </div>

          <div className="read-divider" />

          {/* Desafio */}
          <div className="read-challenge">
            <div className="read-challenge-label">⚔ Desafio</div>
            <div className="read-challenge-q">{scene.challengeQuestion}</div>
          </div>

          {/* Form resposta */}
          {!result && (
            <form className="read-form" onSubmit={handleEvaluate}>
              <textarea
                className="read-textarea"
                placeholder="Escreva sua resposta aqui..."
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                required
              />
              <button className="read-submit" type="submit" disabled={loading}>
                {loading ? 'O mentor está avaliando...' : 'Enviar resposta'}
              </button>
            </form>
          )}

          {/* Resultado */}
          {result && (() => {
            const cfg = isCorrect
              ? { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.3)', label: '✦ Correto!', labelColor: '#6ee7b7', divColor: 'rgba(16,185,129,0.15)' }
              : isPartial
              ? { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', label: '◈ Quase lá', labelColor: '#fcd34d', divColor: 'rgba(245,158,11,0.15)' }
              : { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', label: '✕ Tente de novo', labelColor: '#f87171', divColor: 'rgba(239,68,68,0.15)' }

            return (
              <div className="read-result" style={{ background: cfg.bg, borderColor: cfg.border }}>
                <div className="read-result-label" style={{ color: cfg.labelColor }}>{cfg.label}</div>
                <div className="read-result-text">{result.feedback}</div>
                {(isCorrect || isPartial) && (
                  <>
                    <div className="read-result-narrator" style={{ borderTopColor: cfg.divColor }}>
                      {isLast ? '🏆 Você concluiu este e-book! Parabéns pela jornada.' : 'Continue para a próxima cena.'}
                    </div>
                    {!isLast && <button className="read-next" onClick={goNext}>Próxima cena →</button>}
                  </>
                )}
                {!isCorrect && !isPartial && (
                  <button className="read-next" style={{ borderColor: '#6366f1', background: 'rgba(99,102,241,0.1)', color: '#a5b4fc' }}
                    onClick={() => { setResult(null); setAnswer('') }}>
                    Tentar novamente
                  </button>
                )}
              </div>
            )
          })()}
        </div>
      </div>
    </>
  )
}
