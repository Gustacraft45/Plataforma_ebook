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
        setMessage({ type: 'success', text: 'Conta criada! Faça login.' })
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
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Nunito:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes float0 { 0%,100%{transform:translateY(0) rotate(-6deg)} 50%{transform:translateY(-12px) rotate(-6deg)} }
        @keyframes float1 { 0%,100%{transform:translateY(0) rotate(4deg)} 50%{transform:translateY(-9px) rotate(4deg)} }
        @keyframes float2 { 0%,100%{transform:translateY(0) rotate(-3deg)} 50%{transform:translateY(-14px) rotate(-3deg)} }
        @keyframes float3 { 0%,100%{transform:translateY(0) rotate(7deg)} 50%{transform:translateY(-8px) rotate(7deg)} }
        @keyframes float4 { 0%,100%{transform:translateY(0) rotate(-5deg)} 50%{transform:translateY(-11px) rotate(-5deg)} }
        @keyframes float5 { 0%,100%{transform:translateY(0) rotate(2deg)} 50%{transform:translateY(-10px) rotate(2deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

        .l-root {
          min-height: 100dvh;
          background: #2a1a0e;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Nunito', sans-serif;
          position: relative;
          overflow: hidden;
          padding: 24px;
        }

        /* ── FUNDO ── */
        .l-bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 20% 50%, rgba(139,94,60,.4) 0%, transparent 60%),
            radial-gradient(ellipse 60% 80% at 80% 50%, rgba(90,50,20,.6) 0%, transparent 60%),
            radial-gradient(ellipse 100% 100% at 50% 100%, rgba(58,34,16,.8) 0%, transparent 50%);
          pointer-events: none;
        }
        .l-grain {
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          opacity: .6;
        }
        .l-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 50% 40% at 50% 50%, rgba(196,148,74,.08) 0%, transparent 70%);
          pointer-events: none;
        }

        /* ── LIVROS DECORATIVOS ── */
        .l-books {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .l-book {
          position: absolute;
          border-radius: 3px 6px 6px 3px;
          box-shadow: 2px 4px 16px rgba(0,0,0,.4), inset -2px 0 0 rgba(0,0,0,.2), inset 2px 0 0 rgba(255,255,255,.06);
        }
        .l-book::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 8px;
          background: rgba(0,0,0,.25);
          border-radius: 3px 0 0 3px;
        }
        .l-book::after {
          content: '';
          position: absolute;
          top: 15%; bottom: 15%; left: 12px; right: 8px;
          border-top: 1px solid rgba(255,255,255,.08);
          border-bottom: 1px solid rgba(255,255,255,.08);
        }

        /* ── CARD DO FORM ── */
        .l-card {
          position: relative;
          width: 100%;
          max-width: 420px;
          background: rgba(250,246,240,.97);
          border-radius: 24px;
          padding: 44px 40px;
          box-shadow:
            0 32px 80px rgba(0,0,0,.5),
            0 0 0 1px rgba(255,255,255,.1);
          animation: fadeUp .5s cubic-bezier(.4,0,.2,1);
          backdrop-filter: blur(4px);
        }

        .l-brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 32px;
        }
        .l-brand-mark {
          width: 52px; height: 52px;
          background: linear-gradient(135deg, #8b5e3c, #6b3e1c);
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 24px;
          box-shadow: 0 4px 14px rgba(107,62,28,.4);
          margin-bottom: 14px;
        }
        .l-brand h1 {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 24px;
          font-weight: 700;
          color: #3a2a1a;
          letter-spacing: .01em;
          margin-bottom: 4px;
        }
        .l-brand p {
          font-size: 13px;
          color: #9a8878;
          font-weight: 500;
        }

        /* TABS */
        .l-tabs {
          display: flex;
          background: #f5ede0;
          border-radius: 12px;
          padding: 4px;
          margin-bottom: 26px;
          gap: 3px;
        }
        .l-tab {
          flex: 1;
          padding: 9px;
          border: none;
          background: transparent;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 700;
          color: #b0a090;
          cursor: pointer;
          font-family: 'Nunito', sans-serif;
          transition: all .2s;
        }
        .l-tab.active {
          background: #fff8f0;
          color: #3a2a1a;
          box-shadow: 0 2px 8px rgba(90,60,30,.1);
        }

        /* ROLE */
        .l-role-label {
          font-size: 11px;
          font-weight: 700;
          color: #b0a090;
          text-transform: uppercase;
          letter-spacing: .06em;
          margin-bottom: 8px;
          display: block;
        }
        .l-role-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 18px;
        }
        .l-role-btn {
          padding: 13px 10px;
          border: 1.5px solid #e8ddd0;
          border-radius: 12px;
          background: #fff8f0;
          color: #9a8878;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'Nunito', sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 7px;
          transition: all .2s;
        }
        .l-role-btn:hover { border-color: #c4a882; }
        .l-role-btn.sel {
          border-color: #c4944a;
          background: #fff8ee;
          color: #7a5a2a;
          box-shadow: 0 0 0 3px rgba(196,148,74,.1);
        }
        .l-role-icon { font-size: 20px; }

        /* FIELDS */
        .l-field { margin-bottom: 14px; }
        .l-field label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          color: #9a8878;
          margin-bottom: 7px;
          letter-spacing: .05em;
          text-transform: uppercase;
        }
        .l-input {
          width: 100%;
          padding: 12px 14px;
          background: #fff8f0;
          border: 1.5px solid #e8ddd0;
          border-radius: 10px;
          font-size: 14px;
          color: #3a2a1a;
          font-family: 'Nunito', sans-serif;
          font-weight: 500;
          outline: none;
          transition: border-color .2s, box-shadow .2s;
        }
        .l-input:focus {
          border-color: #c4a882;
          box-shadow: 0 0 0 3px rgba(196,168,130,.12);
        }
        .l-input::placeholder { color: #d4c4b0; }

        /* SUBMIT */
        .l-submit {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #8b5e3c, #c4944a);
          color: #fff8f0;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'Nunito', sans-serif;
          margin-top: 6px;
          transition: opacity .2s, transform .15s;
          box-shadow: 0 4px 14px rgba(139,94,60,.35);
          letter-spacing: .01em;
        }
        .l-submit:hover:not(:disabled) { opacity: .9; transform: translateY(-1px); }
        .l-submit:active:not(:disabled) { transform: scale(.98); }
        .l-submit:disabled { opacity: .4; cursor: not-allowed; box-shadow: none; }

        /* MSG */
        .l-msg {
          margin-top: 14px;
          padding: 11px 14px;
          border-radius: 10px;
          font-size: 13px;
          text-align: center;
          font-weight: 600;
        }
        .l-msg.error { background: #fff0ee; color: #b05a3a; border: 1.5px solid #f0c4b8; }
        .l-msg.success { background: #f0faf0; color: #3a7a3a; border: 1.5px solid #b8e0b8; }

        /* FOOTER */
        .l-footer {
          text-align: center;
          margin-top: 20px;
          font-size: 12px;
          color: rgba(250,246,240,.3);
          position: relative;
        }

        @media (max-width: 480px) {
          .l-card { padding: 36px 24px; }
        }
      `}</style>

      <div className="l-root">
        <div className="l-bg"/>
        <div className="l-grain"/>
        <div className="l-glow"/>

        {/* Livros decorativos */}
        <div className="l-books">
          {/* Esquerda */}
          <div className="l-book" style={{width:48,height:180,background:'linear-gradient(180deg,#8b4a2a,#6b3a1a)',top:'8%',left:'3%',animation:'float0 6s ease-in-out infinite'}}/>
          <div className="l-book" style={{width:36,height:220,background:'linear-gradient(180deg,#5a3a8b,#3a2a6b)',top:'5%',left:'7%',animationDelay:'.5s',animation:'float1 7s .5s ease-in-out infinite'}}/>
          <div className="l-book" style={{width:52,height:160,background:'linear-gradient(180deg,#2a6b4a,#1a4a3a)',top:'12%',left:'11%',animation:'float2 8s 1s ease-in-out infinite'}}/>
          <div className="l-book" style={{width:40,height:200,background:'linear-gradient(180deg,#8b6a2a,#6b4a1a)',top:'3%',left:'15%',animation:'float3 6.5s .3s ease-in-out infinite'}}/>
          <div className="l-book" style={{width:30,height:140,background:'linear-gradient(180deg,#8b2a2a,#6b1a1a)',top:'18%',left:'18%',animation:'float4 7.5s .8s ease-in-out infinite'}}/>

          {/* Direita */}
          <div className="l-book" style={{width:44,height:190,background:'linear-gradient(180deg,#4a6b8b,#2a4a6b)',top:'6%',right:'4%',animation:'float1 7s ease-in-out infinite'}}/>
          <div className="l-book" style={{width:38,height:230,background:'linear-gradient(180deg,#8b5a2a,#6b3a1a)',top:'3%',right:'8%',animation:'float0 6.5s .4s ease-in-out infinite'}}/>
          <div className="l-book" style={{width:50,height:170,background:'linear-gradient(180deg,#6b2a6b,#4a1a4a)',top:'15%',right:'12%',animation:'float3 8s .7s ease-in-out infinite'}}/>
          <div className="l-book" style={{width:34,height:210,background:'linear-gradient(180deg,#2a8b5a,#1a6b3a)',top:'4%',right:'16%',animation:'float2 7s 1.2s ease-in-out infinite'}}/>
          <div className="l-book" style={{width:42,height:155,background:'linear-gradient(180deg,#8b7a2a,#6b5a1a)',top:'20%',right:'19%',animation:'float5 6s .2s ease-in-out infinite'}}/>

          {/* Chão — livros deitados */}
          <div className="l-book" style={{width:120,height:32,background:'linear-gradient(90deg,#8b4a2a,#6b3a1a)',bottom:'4%',left:'5%',borderRadius:'3px',transform:'rotate(0deg)',boxShadow:'0 4px 20px rgba(0,0,0,.5)'}}/>
          <div className="l-book" style={{width:90,height:28,background:'linear-gradient(90deg,#2a6b8b,#1a4a6b)',bottom:'4%',left:'14%',borderRadius:'3px',transform:'rotate(0deg)',boxShadow:'0 4px 20px rgba(0,0,0,.5)'}}/>
          <div className="l-book" style={{width:100,height:30,background:'linear-gradient(90deg,#6b2a6b,#4a1a4a)',bottom:'8%',left:'6%',borderRadius:'3px',transform:'rotate(0deg)',boxShadow:'0 4px 20px rgba(0,0,0,.5)'}}/>
          <div className="l-book" style={{width:110,height:26,background:'linear-gradient(90deg,#2a7a4a,#1a5a3a)',bottom:'4%',right:'5%',borderRadius:'3px',transform:'rotate(0deg)',boxShadow:'0 4px 20px rgba(0,0,0,.5)'}}/>
          <div className="l-book" style={{width:85,height:32,background:'linear-gradient(90deg,#8b6a2a,#6b4a1a)',bottom:'4%',right:'14%',borderRadius:'3px',transform:'rotate(0deg)',boxShadow:'0 4px 20px rgba(0,0,0,.5)'}}/>
          <div className="l-book" style={{width:95,height:28,background:'linear-gradient(90deg,#8b2a2a,#6b1a1a)',bottom:'8%',right:'6%',borderRadius:'3px',transform:'rotate(0deg)',boxShadow:'0 4px 20px rgba(0,0,0,.5)'}}/>
        </div>

        {/* Card */}
        <div className="l-card">
          <div className="l-brand">
            <div className="l-brand-mark">📖</div>
            <h1>Arcano Saber</h1>
            <p>Plataforma de e-books interativos</p>
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
                    <span className="l-role-icon">📚</span>
                    Leitor
                  </button>
                  <button type="button" className={`l-role-btn ${role === 'escritor' ? 'sel' : ''}`} onClick={() => setRole('escritor')}>
                    <span className="l-role-icon">✍️</span>
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
              {loading ? 'Aguarde...' : isLogin ? 'Entrar na jornada' : 'Criar minha conta'}
            </button>
          </form>

          {message && <div className={`l-msg ${message.type}`}>{message.text}</div>}
        </div>

      </div>
    </>
  )
}
