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
    if (!isLogin && !role) { setMessage({ type: 'error', text: 'Escolha o tipo de conta.' }); return }
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
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        .lr{min-height:100vh;background:#0d0f14;display:flex;align-items:center;justify-content:center;font-family:'DM Sans',sans-serif;position:relative;overflow:hidden;}
        .lg{position:absolute;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,rgba(139,92,246,.13) 0%,transparent 70%);top:-100px;left:50%;transform:translateX(-50%);pointer-events:none;}
        .lc{position:relative;width:100%;max-width:420px;background:#13151c;border:1px solid #2a2d3a;border-radius:20px;padding:48px 40px;box-shadow:0 32px 80px rgba(0,0,0,.5);}
        .lb{text-align:center;margin-bottom:32px;}
        .li{width:48px;height:48px;background:linear-gradient(135deg,#8b5cf6,#6366f1);border-radius:14px;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;font-size:22px;}
        .lb h1{font-family:'Lora',serif;font-size:22px;color:#f1f0ff;margin:0 0 5px;}
        .lb p{font-size:13px;color:#666980;}
        .lt{display:flex;background:#0d0f14;border-radius:10px;padding:4px;margin-bottom:24px;}
        .ltt{flex:1;padding:9px;border:none;background:transparent;border-radius:7px;font-size:13px;font-weight:500;cursor:pointer;transition:all .2s;color:#666980;font-family:'DM Sans',sans-serif;}
        .ltt.active{background:#1e2030;color:#c4b5fd;box-shadow:0 2px 8px rgba(0,0,0,.3);}
        .lf{margin-bottom:14px;}
        .lf label{display:block;font-size:11px;font-weight:500;color:#8b8fa8;margin-bottom:7px;letter-spacing:.04em;text-transform:uppercase;}
        .lf input{width:100%;padding:12px 16px;background:#0d0f14;border:1px solid #2a2d3a;border-radius:10px;font-size:14px;color:#f1f0ff;font-family:'DM Sans',sans-serif;transition:border-color .2s;outline:none;}
        .lf input:focus{border-color:#6366f1;}
        .lf input::placeholder{color:#3d4060;}
        .role-row{display:flex;gap:10px;margin-bottom:16px;}
        .role-btn{flex:1;padding:12px 8px;border:1px solid #2a2d3a;border-radius:10px;background:#0d0f14;color:#666980;font-size:13px;font-weight:500;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .2s;display:flex;flex-direction:column;align-items:center;gap:5px;}
        .role-btn .ri{font-size:20px;}
        .role-btn.sel{border-color:#6366f1;background:rgba(99,102,241,.1);color:#a5b4fc;}
        .lbtn{width:100%;padding:13px;background:linear-gradient(135deg,#7c3aed,#6366f1);color:white;border:none;border-radius:10px;font-size:14px;font-weight:500;cursor:pointer;margin-top:6px;font-family:'DM Sans',sans-serif;transition:opacity .2s;}
        .lbtn:hover:not(:disabled){opacity:.9;}
        .lbtn:disabled{opacity:.45;cursor:not-allowed;}
        .lmsg{margin-top:14px;padding:10px 14px;border-radius:8px;font-size:13px;text-align:center;}
        .lmsg.error{background:rgba(239,68,68,.1);color:#f87171;border:1px solid rgba(239,68,68,.2);}
        .lmsg.success{background:rgba(16,185,129,.1);color:#6ee7b7;border:1px solid rgba(16,185,129,.2);}
        .role-label{font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:#8b8fa8;font-weight:500;margin-bottom:8px;display:block;}
      `}</style>
      <div className="lr">
        <div className="lg" />
        <div className="lc">
          <div className="lb">
            <div className="li">📖</div>
            <h1>Arcano Saber</h1>
            <p>Plataforma de e-books interativos</p>
          </div>
          <div className="lt">
            <button className={`ltt ${isLogin ? 'active' : ''}`} onClick={() => { setIsLogin(true); setMessage(null) }}>Entrar</button>
            <button className={`ltt ${!isLogin ? 'active' : ''}`} onClick={() => { setIsLogin(false); setMessage(null) }}>Cadastrar</button>
          </div>
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div className="lf">
                  <label>Nome completo</label>
                  <input type="text" placeholder="Seu nome" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div>
                  <span className="role-label">Tipo de conta</span>
                  <div className="role-row">
                    <button type="button" className={`role-btn ${role === 'leitor' ? 'sel' : ''}`} onClick={() => setRole('leitor')}>
                      <span className="ri">📚</span> Leitor
                    </button>
                    <button type="button" className={`role-btn ${role === 'escritor' ? 'sel' : ''}`} onClick={() => setRole('escritor')}>
                      <span className="ri">✍️</span> Escritor
                    </button>
                  </div>
                </div>
              </>
            )}
            <div className="lf">
              <label>E-mail</label>
              <input type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="lf">
              <label>Senha</label>
              <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button className="lbtn" type="submit" disabled={loading}>
              {loading ? 'Aguarde...' : isLogin ? 'Entrar na jornada' : 'Criar minha conta'}
            </button>
          </form>
          {message && <div className={`lmsg ${message.type}`}>{message.text}</div>}
        </div>
      </div>
    </>
  )
}
