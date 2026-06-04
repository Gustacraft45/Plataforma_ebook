import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from './api'

export default function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const { ok, data } = isLogin
      ? await api.auth.login(email, password)
      : await api.auth.register(name, email, password)

    if (ok) {
      if (isLogin) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        navigate('/dashboard')
      } else {
        setMessage({ type: 'success', text: 'Conta criada! Faça login.' })
        setIsLogin(true)
        setPassword('')
      }
    } else {
      setMessage({ type: 'error', text: data.message })
    }
    setLoading(false)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        .login-root {
          min-height: 100vh;
          background: #0d0f14;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow: hidden;
        }

        .login-bg-glow {
          position: absolute;
          width: 600px; height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%);
          top: -100px; left: 50%; transform: translateX(-50%);
          pointer-events: none;
        }

        .login-card {
          position: relative;
          width: 100%; max-width: 420px;
          background: #13151c;
          border: 1px solid #2a2d3a;
          border-radius: 20px;
          padding: 48px 40px;
          box-shadow: 0 32px 80px rgba(0,0,0,0.5);
        }

        .login-brand {
          text-align: center;
          margin-bottom: 36px;
        }

        .login-brand-icon {
          width: 48px; height: 48px;
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px;
          font-size: 22px;
        }

        .login-brand h1 {
          font-family: 'Lora', serif;
          font-size: 22px;
          font-weight: 600;
          color: #f1f0ff;
          margin: 0 0 6px;
        }

        .login-brand p {
          font-size: 13px;
          color: #666980;
          margin: 0;
        }

        .login-tabs {
          display: flex;
          background: #0d0f14;
          border-radius: 10px;
          padding: 4px;
          margin-bottom: 28px;
        }

        .login-tab {
          flex: 1;
          padding: 9px;
          border: none;
          background: transparent;
          border-radius: 7px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          color: #666980;
          font-family: 'DM Sans', sans-serif;
        }

        .login-tab.active {
          background: #1e2030;
          color: #c4b5fd;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }

        .login-field {
          margin-bottom: 14px;
        }

        .login-field label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: #8b8fa8;
          margin-bottom: 7px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .login-field input {
          width: 100%;
          padding: 12px 16px;
          background: #0d0f14;
          border: 1px solid #2a2d3a;
          border-radius: 10px;
          font-size: 14px;
          color: #f1f0ff;
          font-family: 'DM Sans', sans-serif;
          transition: border-color 0.2s;
          box-sizing: border-box;
          outline: none;
        }

        .login-field input:focus {
          border-color: #6366f1;
        }

        .login-field input::placeholder { color: #3d4060; }

        .login-btn {
          width: 100%;
          padding: 13px;
          background: linear-gradient(135deg, #7c3aed, #6366f1);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          margin-top: 8px;
          font-family: 'DM Sans', sans-serif;
          transition: opacity 0.2s, transform 0.1s;
          letter-spacing: 0.02em;
        }

        .login-btn:hover:not(:disabled) { opacity: 0.92; transform: translateY(-1px); }
        .login-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .login-msg {
          margin-top: 16px;
          padding: 11px 14px;
          border-radius: 8px;
          font-size: 13px;
          text-align: center;
        }

        .login-msg.error { background: rgba(239,68,68,0.1); color: #f87171; border: 1px solid rgba(239,68,68,0.2); }
        .login-msg.success { background: rgba(16,185,129,0.1); color: #6ee7b7; border: 1px solid rgba(16,185,129,0.2); }
      `}</style>

      <div className="login-root">
        <div className="login-bg-glow" />
        <div className="login-card">
          <div className="login-brand">
            <div className="login-brand-icon">📖</div>
            <h1>Arcano Saber</h1>
            <p>Plataforma de e-books interativos</p>
          </div>

          <div className="login-tabs">
            <button className={`login-tab ${isLogin ? 'active' : ''}`} onClick={() => { setIsLogin(true); setMessage(null) }}>Entrar</button>
            <button className={`login-tab ${!isLogin ? 'active' : ''}`} onClick={() => { setIsLogin(false); setMessage(null) }}>Cadastrar</button>
          </div>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="login-field">
                <label>Nome completo</label>
                <input type="text" placeholder="Seu nome" value={name} onChange={e => setName(e.target.value)} required />
              </div>
            )}
            <div className="login-field">
              <label>E-mail</label>
              <input type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="login-field">
              <label>Senha</label>
              <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? 'Aguarde...' : isLogin ? 'Entrar na jornada' : 'Criar minha conta'}
            </button>
          </form>

          {message && <div className={`login-msg ${message.type}`}>{message.text}</div>}
        </div>
      </div>
    </>
  )
}
