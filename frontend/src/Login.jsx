import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('⏳ Carregando...')
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register'
    const bodyData = isLogin ? { email, password } : { name, email, password }

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      })
      const data = await response.json()

      if (response.ok) {
        if (isLogin) {
          localStorage.setItem('token', data.token) // Salva o crachá de segurança
          navigate('/dashboard') // MÁGICA: Vai para a lista de livros
        } else {
          setMessage('✅ Cadastro realizado! Faça o login.')
          setIsLogin(true)
          setPassword('')
        }
      } else {
        setMessage(`❌ Erro: ${data.message}`)
      }
    } catch (error) {
      setMessage('⚠️ Erro de conexão. O backend está rodando?')
    }
  }

  return (
    <div style={cardContainerStyle}>
      <div style={cardStyle}>
        <h2 style={{ textAlign: 'center', color: '#1f2937', marginBottom: '24px' }}>
          {isLogin ? 'Plataforma TCC' : 'Crie sua conta'}
        </h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!isLogin && <input type="text" placeholder="Nome completo" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />}
          <input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
          <input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
          <button type="submit" style={buttonStyle}>{isLogin ? 'Entrar' : 'Cadastrar'}</button>
        </form>
        {message && <div style={messageStyle}>{message}</div>}
        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#6b7280' }}>
          {isLogin ? 'Ainda não tem conta? ' : 'Já tem conta? '}
          <span onClick={() => { setIsLogin(!isLogin); setMessage(''); }} style={{ color: '#3b82f6', cursor: 'pointer', fontWeight: 'bold' }}>
            {isLogin ? 'Cadastre-se' : 'Faça login'}
          </span>
        </p>
      </div>
    </div>
  )
}

// Estilos base compartilhados
const cardContainerStyle = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', fontFamily: 'sans-serif' }
const cardStyle = { backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }
const inputStyle = { padding: '12px 16px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px', outline: 'none' }
const buttonStyle = { padding: '14px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }
const messageStyle = { marginTop: '20px', padding: '12px', borderRadius: '8px', backgroundColor: '#f3f4f6', textAlign: 'center', fontSize: '14px' }