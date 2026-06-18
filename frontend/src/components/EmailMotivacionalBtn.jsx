import { useState } from 'react'

export default function EmailMotivacionalBtn({ style = {} }) {
  const [status, setStatus] = useState('idle')
  const [msg, setMsg] = useState('')

  const handleSend = async () => {
    setStatus('loading')
    try {
      const res = await fetch('/api/email/send-me', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('success')
        setMsg(data.message || 'E-mail enviado!')
      } else {
        setStatus('error')
        setMsg(data.message || 'Erro ao enviar e-mail.')
      }
    } catch {
      setStatus('error')
      setMsg('Erro de conexão.')
    }
    setTimeout(() => { setStatus('idle'); setMsg('') }, 4000)
  }

  const states = {
    idle:    { label: '📧 Receber meu relatório por e-mail', bg: 'linear-gradient(135deg,#c4944a,#8b5e3c)', cursor: 'pointer' },
    loading: { label: '⏳ Enviando...', bg: '#c4b0a0', cursor: 'not-allowed' },
    success: { label: '✅ ' + (msg || 'E-mail enviado!'), bg: 'linear-gradient(135deg,#4a7c3f,#2d5a28)', cursor: 'default' },
    error:   { label: '❌ ' + (msg || 'Erro'), bg: 'linear-gradient(135deg,#8b3a3a,#6b2020)', cursor: 'default' },
  }

  const s = states[status]

  return (
    <button
      onClick={status === 'idle' ? handleSend : undefined}
      disabled={status === 'loading'}
      style={{
        background: s.bg,
        color: '#fff8f0',
        border: 'none',
        borderRadius: 10,
        padding: '11px 20px',
        fontSize: 14,
        fontWeight: 700,
        cursor: s.cursor,
        transition: 'all .2s',
        fontFamily: 'inherit',
        width: '100%',
        textAlign: 'center',
        ...style,
      }}
    >
      {s.label}
    </button>
  )
}