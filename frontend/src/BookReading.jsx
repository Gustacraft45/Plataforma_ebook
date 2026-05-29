import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

export default function BookReading() {
  const { id } = useParams() // Pega o ID do livro direto da URL
  const navigate = useNavigate()
  const [book, setBook] = useState(null)
  const [studentAnswer, setStudentAnswer] = useState('')
  const [aiResult, setAiResult] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/books/${id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
        if (response.ok) {
          const data = await response.json()
          setBook(data)
        } else {
          navigate('/dashboard')
        }
      } catch (error) {
        console.error(error)
      }
    }
    fetchBookDetails()
  }, [id, navigate])

  const handleEvaluate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setAiResult(null)

    try {
      const response = await fetch('http://localhost:5000/api/evaluate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Protegido por Token!
        },
        body: JSON.stringify({
          question: book.nodes[0].challengeQuestion, // Pega a pergunta da primeira cena
          studentAnswer: studentAnswer
        })
      })

      const data = await response.json()
      setAiResult(data) // Salva o JSON da IA contendo { status, feedback }
    } catch (error) {
      alert('Erro ao falar com a IA.')
    } finally {
      setLoading(false)
    }
  }

  if (!book) return <div style={{ padding: '40px', textAlign: 'center' }}>Carregando livro...</div>

  // Pegamos a primeira cena (node) para exibir na tela
  const currentScene = book.nodes[0]

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto', backgroundColor: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer', fontWeight: 'bold', marginBottom: '20px' }}>← Voltar para a estante</button>
        
        <h1 style={{ color: '#1f2937', marginBottom: '8px' }}>{book.title}</h1>
        <p style={{ color: '#9ca3af', fontStyle: 'italic', marginBottom: '30px' }}>Narrado por: {book.characterName}</p>

        {/* Balão de fala do Personagem */}
        <div style={{ backgroundColor: '#f3f4f6', padding: '24px', borderRadius: '12px', borderLeft: '5px solid #3b82f6', marginBottom: '40px', lineHeight: '1.6', color: '#374151' }}>
          <strong>{book.characterName} diz:</strong><br/>
          {currentScene.storyText}
        </div>

        {/* Bloco do Desafio Final */}
        <div style={{ borderTop: '2px dashed #e5e7eb', paddingTop: '30px' }}>
          <h3 style={{ color: '#1f2937', marginBottom: '12px' }}>🎯 Desafio do Mentor</h3>
          <p style={{ color: '#4b5563', fontWeight: '500', marginBottom: '16px' }}>{currentScene.challengeQuestion}</p>
          
          <form onSubmit={handleEvaluate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <textarea 
              placeholder="Digite aqui a sua resposta explicativa..."
              value={studentAnswer}
              onChange={(e) => setStudentAnswer(e.target.value)}
              required
              rows={4}
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px', resize: 'vertical', fontFamily: 'inherit' }}
            />
            <button type="submit" disabled={loading} style={{ padding: '12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
              {loading ? '🤖 O professor IA está corrigindo...' : 'Enviar Resposta para a IA'}
            </button>
          </form>

          {/* Resultado da Avaliação da Groq/Llama 3 */}
          {aiResult && (
            <div style={{ marginTop: '24px', padding: '20px', borderRadius: '8px', backgroundColor: aiResult.status === 'correto' ? '#def7ec' : aiResult.status === 'parcial' ? '#fef08a' : '#fde8e8', color: '#1f2937' }}>
              <h4 style={{ margin: '0 0 8px 0', textTransform: 'uppercase', color: aiResult.status === 'correto' ? '#03543f' : aiResult.status === 'parcial' ? '#713f12' : '#9b1c1c' }}>
                Resultado: {aiResult.status}
              </h4>
              <p style={{ margin: '0', fontSize: '15px', lineHeight: '1.5' }}>{aiResult.feedback}</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}