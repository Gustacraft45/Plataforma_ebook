import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from './api'

export default function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('')
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isLogin && !role) { setMessage({ type: 'error', text: 'Selecione o tipo de conta.' }); return }
    setLoading(true); setMessage(null)
    const { ok, data } = isLogin
      ? await api.auth.login(email, password)
      : await api.auth.register(name, email, password, role)
    if (ok) {
      if (isLogin) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        navigate(data.user.role === 'escritor' ? '/author' : '/dashboard')
      } else {
        setMessage({ type: 'success', text: 'Conta criada. Faça login.' })
        setIsLogin(true); setPassword(''); setRole('')
      }
    } else {
      setMessage({ type: 'error', text: data.message })
    }
    setLoading(false)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&family=Geist+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .l-root {
          min-height: 100dvh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: #09090b;
          font-family: 'Outfit', sans-serif;
        }

        /* ── LEFT PANEL ── */
        .l-left {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px;
          border-right: 1px solid #1c1c1e;
          overflow: hidden;
        }
        .l-left-bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 50% at 20% 80%, rgba(16,185,129,.07) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 80% 20%, rgba(59,130,246,.05) 0%, transparent 70%);
          pointer-events: none;
        }
        .l-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.02) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }
        .l-brand {
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .l-brand-icon {
          width: 36px;
          height: 36px;
          border: 1px solid #27272a;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .l-brand-name {
          font-size: 15px;
          font-weight: 600;
          color: #fafafa;
          letter-spacing: -.01em;
        }
        .l-hero {
          position: relative;
        }
        .l-hero-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 500;
          color: #10b981;
          letter-spacing: .08em;
          text-transform: uppercase;
          margin-bottom: 24px;
        }
        .l-hero-tag-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #10b981;
          animation: pulse-dot 2s infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: .4; transform: scale(.8); }
        }
        .l-hero h1 {
          font-size: clamp(32px, 3.5vw, 48px);
          font-weight: 600;
          color: #fafafa;
          line-height: 1.1;
          letter-spacing: -.03em;
          margin-bottom: 16px;
        }
        .l-hero h1 em {
          font-style: normal;
          color: #10b981;
        }
        .l-hero p {
          font-size: 15px;
          color: #71717a;
          line-height: 1.7;
          max-width: 380px;
        }
        .l-stats {
          position: relative;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1px;
          background: #1c1c1e;
          border: 1px solid #1c1c1e;
          border-radius: 16px;
          overflow: hidden;
        }
        .l-stat {
          background: #09090b;
          padding: 20px 22px;
        }
        .l-stat-val {
          font-family: 'Geist Mono', monospace;
          font-size: 24px;
          font-weight: 500;
          color: #fafafa;
          letter-spacing: -.02em;
        }
        .l-stat-label {
          font-size: 12px;
          color: #52525b;
          margin-top: 4px;
        }

        /* ── RIGHT PANEL ── */
        .l-right {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px;
        }
        .l-form-wrap {
          width: 100%;
          max-width: 380px;
        }
        .l-form-header {
          margin-bottom: 36px;
        }
        .l-form-header h2 {
          font-size: 22px;
          font-weight: 600;
          color: #fafafa;
          letter-spacing: -.02em;
          margin-bottom: 6px;
        }
        .l-form-header p {
          font-size: 14px;
          color: #52525b;
        }

        /* Tabs */
        .l-tabs {
          display: flex;
          background: #111113;
          border: 1px solid #1c1c1e;
          border-radius: 10px;
          padding: 3px;
          margin-bottom: 28px;
          gap: 2px;
        }
        .l-tab {
          flex: 1;
          padding: 8px;
          border: none;
          background: transparent;
          border-radius: 7px;
          font-size: 13px;
          font-weight: 500;
          color: #52525b;
          cursor: pointer;
          font-family: 'Outfit', sans-serif;
          transition: all .18s;
        }
        .l-tab.active {
          background: #1c1c1e;
          color: #fafafa;
        }

        /* Role selector */
        .l-role-label {
          font-size: 11px;
          font-weight: 500;
          color: #52525b;
          text-transform: uppercase;
          letter-spacing: .06em;
          margin-bottom: 8px;
          display: block;
        }
        .l-role-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 20px;
        }
        .l-role-btn {
          padding: 14px 12px;
          border: 1px solid #1c1c1e;
          border-radius: 10px;
          background: #111113;
          color: #52525b;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          font-family: 'Outfit', sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          transition: all .18s;
        }
        .l-role-btn svg { opacity: .5; transition: opacity .18s; }
        .l-role-btn.sel {
          border-color: #10b981;
          background: rgba(16,185,129,.06);
          color: #10b981;
        }
        .l-role-btn.sel svg { opacity: 1; }

        /* Fields */
        .l-field { margin-bottom: 16px; }
        .l-field label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: #52525b;
          margin-bottom: 7px;
          letter-spacing: .04em;
        }
        .l-input {
          width: 100%;
          padding: 11px 14px;
          background: #111113;
          border: 1px solid #1c1c1e;
          border-radius: 10px;
          font-size: 14px;
          color: #fafafa;
          font-family: 'Outfit', sans-serif;
          outline: none;
          transition: border-color .18s;
        }
        .l-input:focus { border-color: #3f3f46; }
        .l-input::placeholder { color: #3f3f46; }

        /* Submit */
        .l-submit {
          width: 100%;
          padding: 12px;
          background: #fafafa;
          color: #09090b;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          font-family: 'Outfit', sans-serif;
          margin-top: 8px;
          transition: opacity .18s, transform .1s;
          letter-spacing: -.01em;
        }
        .l-submit:hover:not(:disabled) { opacity: .88; transform: translateY(-1px); }
        .l-submit:active:not(:disabled) { transform: scale(.98) translateY(0); }
        .l-submit:disabled { opacity: .35; cursor: not-allowed; }

        /* Message */
        .l-msg {
          margin-top: 14px;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 13px;
          text-align: center;
        }
        .l-msg.error { background: rgba(239,68,68,.07); color: #f87171; border: 1px solid rgba(239,68,68,.15); }
        .l-msg.success { background: rgba(16,185,129,.07); color: #6ee7b7; border: 1px solid rgba(16,185,129,.15); }

        @media (max-width: 767px) {
          .l-root { grid-template-columns: 1fr; }
          .l-left { display: none; }
          .l-right { padding: 32px 24px; }
        }
      `}</style>

      <div className="l-root">
        {/* LEFT */}
        <div className="l-left">
          <div className="l-left-bg" />
          <div className="l-grid" />
          <div className="l-brand">
            <div className="l-brand-icon">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 4h12M3 8h8M3 12h10" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="l-brand-name">Arcano Saber</span>
          </div>

          <div className="l-hero">
            <div className="l-hero-tag">
              <div className="l-hero-tag-dot" />
              Plataforma educacional
            </div>
            <h1>Aprenda através<br/>de <em>histórias</em> reais.</h1>
            <p>E-books interativos com narrativa RPG e avaliação por inteligência artificial. Cada resposta sua avança a jornada.</p>
          </div>

          <div className="l-stats">
            <div className="l-stat">
              <div className="l-stat-val">50+</div>
              <div className="l-stat-label">Cenas por livro</div>
            </div>
            <div className="l-stat">
              <div className="l-stat-val">IA</div>
              <div className="l-stat-label">Avaliação em tempo real</div>
            </div>
            <div className="l-stat">
              <div className="l-stat-val">XP</div>
              <div className="l-stat-label">Sistema de progressão</div>
            </div>
            <div className="l-stat">
              <div className="l-stat-val">100%</div>
              <div className="l-stat-label">Respostas abertas</div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="l-right">
          <div className="l-form-wrap">
            <div className="l-form-header">
              <h2>{isLogin ? 'Bem-vindo de volta.' : 'Crie sua conta.'}</h2>
              <p>{isLogin ? 'Entre para continuar sua jornada.' : 'Comece a aprender hoje.'}</p>
            </div>

            <div className="l-tabs">
              <button className={`l-tab ${isLogin ? 'active' : ''}`} onClick={() => { setIsLogin(true); setMessage(null) }}>Entrar</button>
              <button className={`l-tab ${!isLogin ? 'active' : ''}`} onClick={() => { setIsLogin(false); setMessage(null) }}>Cadastrar</button>
            </div>

            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <>
                  <div className="l-field">
                    <label>Nome completo</label>
                    <input className="l-input" type="text" placeholder="Seu nome" value={name} onChange={e => setName(e.target.value)} required />
                  </div>
                  <span className="l-role-label">Tipo de conta</span>
                  <div className="l-role-row">
                    <button type="button" className={`l-role-btn ${role === 'leitor' ? 'sel' : ''}`} onClick={() => setRole('leitor')}>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M4 3h5.5a2.5 2.5 0 0 1 0 5H4V3zM4 8h6a3 3 0 0 1 0 6H4V8z"/>
                      </svg>
                      Leitor
                    </button>
                    <button type="button" className={`l-role-btn ${role === 'escritor' ? 'sel' : ''}`} onClick={() => setRole('escritor')}>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M14.5 2.5a2.121 2.121 0 0 1 3 3L6 17H3v-3L14.5 2.5z"/>
                      </svg>
                      Escritor
                    </button>
                  </div>
                </>
              )}
              <div className="l-field">
                <label>E-mail</label>
                <input className="l-input" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="l-field">
                <label>Senha</label>
                <input className="l-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <button className="l-submit" type="submit" disabled={loading}>
                {loading ? 'Aguarde...' : isLogin ? 'Entrar' : 'Criar conta'}
              </button>
            </form>

            {message && <div className={`l-msg ${message.type}`}>{message.text}</div>}
          </div>
        </div>
      </div>
    </>
  )
}
