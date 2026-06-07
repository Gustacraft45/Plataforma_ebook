import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from './api'

const SUBJECTS = ['Programação','Matemática','Física','Química','Biologia','História','Geografia','Filosofia','Literatura','Outros']

function emptyNode() {
  return { id: `cena_${Date.now()}`, title: '', storyText: '', challengeQuestion: '', expectedAnswer: '' }
}

export default function AuthorPanel() {
  const navigate = useNavigate()
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('list') // 'list' | 'create' | 'edit'
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title: '', subject: '', characterName: '', nodes: [emptyNode()] })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const loadBooks = async () => {
    setLoading(true)
    const { ok, data } = await api.books.mine()
    if (ok) setBooks(data)
    setLoading(false)
  }

  useEffect(() => { loadBooks() }, [])

  const openCreate = () => {
    setForm({ title: '', subject: '', characterName: '', nodes: [emptyNode()] })
    setEditing(null); setMsg(null); setView('create')
  }

  const openEdit = (book) => {
    setForm({ title: book.title, subject: book.subject, characterName: book.characterName, nodes: book.nodes })
    setEditing(book._id); setMsg(null); setView('edit')
  }

  const addNode = () => setForm(f => ({ ...f, nodes: [...f.nodes, emptyNode()] }))
  const removeNode = (i) => setForm(f => ({ ...f, nodes: f.nodes.filter((_, idx) => idx !== i) }))
  const updateNode = (i, field, val) => setForm(f => ({
    ...f, nodes: f.nodes.map((n, idx) => idx === i ? { ...n, [field]: val } : n)
  }))
  const updateForm = (field, val) => setForm(f => ({ ...f, [field]: val }))

  const handleSave = async () => {
    if (!form.title || !form.subject || !form.characterName || form.nodes.length === 0)
      return setMsg({ type: 'error', text: 'Preencha todos os campos e adicione pelo menos uma cena.' })

    for (const [i, n] of form.nodes.entries()) {
      if (!n.title || !n.storyText || !n.challengeQuestion)
        return setMsg({ type: 'error', text: `Cena ${i+1}: título, narrativa e pergunta são obrigatórios.` })
    }

    setSaving(true); setMsg(null)
    const { ok, data } = editing
      ? await api.books.update(editing, form)
      : await api.books.create(form)

    if (ok) {
      setMsg({ type: 'success', text: editing ? 'Livro atualizado!' : 'Livro publicado com sucesso!' })
      await loadBooks()
      setTimeout(() => setView('list'), 1200)
    } else {
      setMsg({ type: 'error', text: data.message })
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    const { ok } = await api.books.delete(id)
    if (ok) { setDeleteId(null); await loadBooks() }
  }

  const logout = () => { localStorage.clear(); navigate('/') }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        *{box-sizing:border-box;}
        .ap-root{min-height:100vh;background:#0d0f14;font-family:'DM Sans',sans-serif;color:#c9c8d6;}
        .ap-nav{display:flex;align-items:center;justify-content:space-between;padding:16px 40px;border-bottom:1px solid #1e2030;position:sticky;top:0;background:rgba(13,15,20,.92);backdrop-filter:blur(12px);z-index:10;}
        .ap-brand{font-family:'Lora',serif;font-size:18px;color:#f1f0ff;display:flex;align-items:center;gap:10px;}
        .ap-nav-right{display:flex;align-items:center;gap:12px;}
        .ap-role{font-size:11px;padding:4px 12px;border-radius:20px;background:rgba(139,92,246,.15);color:#c4b5fd;border:1px solid rgba(139,92,246,.3);}
        .ap-logout{background:none;border:1px solid #2a2d3a;color:#4a4d60;font-size:12px;padding:7px 12px;border-radius:8px;cursor:pointer;font-family:'DM Sans',sans-serif;}
        .ap-logout:hover{color:#c9c8d6;border-color:#4a4d60;}
        .ap-body{max-width:900px;margin:0 auto;padding:48px 40px 80px;}
        .ap-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:36px;}
        .ap-title{font-family:'Lora',serif;font-size:28px;color:#f1f0ff;margin:0;}
        .ap-sub{font-size:13px;color:#4a4d60;margin-top:4px;}
        .btn-primary{padding:10px 20px;background:linear-gradient(135deg,#7c3aed,#6366f1);color:white;border:none;border-radius:10px;font-size:13px;font-weight:500;cursor:pointer;font-family:'DM Sans',sans-serif;}
        .btn-primary:hover{opacity:.9;}
        .btn-primary:disabled{opacity:.45;cursor:not-allowed;}
        .btn-ghost{padding:8px 16px;background:none;border:1px solid #2a2d3a;color:#c9c8d6;border-radius:8px;font-size:13px;cursor:pointer;font-family:'DM Sans',sans-serif;}
        .btn-ghost:hover{border-color:#4a4d60;}
        .btn-danger{padding:7px 14px;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.2);color:#f87171;border-radius:8px;font-size:12px;cursor:pointer;font-family:'DM Sans',sans-serif;}
        .btn-danger:hover{background:rgba(239,68,68,.2);}
        .btn-edit{padding:7px 14px;background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.25);color:#a5b4fc;border-radius:8px;font-size:12px;cursor:pointer;font-family:'DM Sans',sans-serif;}
        .btn-edit:hover{background:rgba(99,102,241,.2);}

        /* Book cards */
        .bk-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px;}
        .bk-card{background:#13151c;border:1px solid #1e2030;border-radius:16px;padding:24px;display:flex;flex-direction:column;gap:12px;animation:fadeUp .3s ease both;}
        .bk-subj{font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.08em;padding:3px 10px;border-radius:20px;display:inline-block;width:fit-content;}
        .bk-title{font-family:'Lora',serif;font-size:16px;color:#f1f0ff;line-height:1.4;margin:0;}
        .bk-meta{font-size:12px;color:#4a4d60;}
        .bk-actions{display:flex;gap:8px;margin-top:4px;}
        .empty{text-align:center;padding:64px 0;color:#4a4d60;border:1px dashed #1e2030;border-radius:16px;}

        /* Form */
        .form-card{background:#13151c;border:1px solid #1e2030;border-radius:16px;padding:32px;}
        .form-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;}
        .form-field{margin-bottom:16px;}
        .form-label{display:block;font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:#8b8fa8;margin-bottom:7px;font-weight:500;}
        .form-input{width:100%;padding:11px 14px;background:#0d0f14;border:1px solid #2a2d3a;border-radius:10px;font-size:14px;color:#f1f0ff;font-family:'DM Sans',sans-serif;outline:none;transition:border-color .2s;}
        .form-input:focus{border-color:#6366f1;}
        .form-input::placeholder{color:#3d4060;}
        select.form-input option{background:#13151c;}
        .form-textarea{width:100%;padding:11px 14px;background:#0d0f14;border:1px solid #2a2d3a;border-radius:10px;font-size:14px;color:#f1f0ff;font-family:'DM Sans',sans-serif;outline:none;resize:vertical;min-height:80px;line-height:1.6;transition:border-color .2s;}
        .form-textarea:focus{border-color:#6366f1;}
        .form-textarea::placeholder{color:#3d4060;}

        /* Node card */
        .node-card{background:#0d0f14;border:1px solid #2a2d3a;border-radius:14px;padding:24px;margin-bottom:16px;position:relative;}
        .node-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;}
        .node-label{font-size:12px;font-weight:500;color:#6366f1;text-transform:uppercase;letter-spacing:.06em;}
        .node-remove{background:none;border:none;color:#4a4d60;font-size:18px;cursor:pointer;padding:0;line-height:1;}
        .node-remove:hover{color:#f87171;}
        .expected-box{background:rgba(245,158,11,.06);border:1px solid rgba(245,158,11,.2);border-radius:10px;padding:14px;margin-top:8px;}
        .expected-label{font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:#f59e0b;margin-bottom:6px;font-weight:500;}

        /* Msg */
        .ap-msg{padding:11px 16px;border-radius:10px;font-size:13px;margin-bottom:20px;}
        .ap-msg.error{background:rgba(239,68,68,.08);color:#f87171;border:1px solid rgba(239,68,68,.2);}
        .ap-msg.success{background:rgba(16,185,129,.08);color:#6ee7b7;border:1px solid rgba(16,185,129,.2);}

        /* Delete modal */
        .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;z-index:100;}
        .modal{background:#13151c;border:1px solid #2a2d3a;border-radius:16px;padding:32px;max-width:360px;width:90%;text-align:center;}
        .modal h3{font-family:'Lora',serif;font-size:18px;color:#f1f0ff;margin:0 0 10px;}
        .modal p{font-size:14px;color:#666980;margin:0 0 24px;line-height:1.6;}
        .modal-actions{display:flex;gap:10px;justify-content:center;}
      `}</style>

      <div className="ap-root">
        <nav className="ap-nav">
          <div className="ap-brand">📖 Arcano Saber</div>
          <div className="ap-nav-right">
            <span className="ap-role">✍️ Escritor</span>
            <span style={{ fontSize: 13, color: '#666980' }}>{user.name}</span>
            <button className="ap-logout" onClick={logout}>Sair</button>
          </div>
        </nav>

        <div className="ap-body">
          {/* ── LISTA ── */}
          {view === 'list' && (
            <>
              <div className="ap-header">
                <div>
                  <h2 className="ap-title">Meus livros</h2>
                  <p className="ap-sub">{books.length} publicação{books.length !== 1 ? 'ões' : ''}</p>
                </div>
                <button className="btn-primary" onClick={openCreate}>+ Novo livro</button>
              </div>

              {loading ? (
                <div style={{ color: '#4a4d60', textAlign: 'center', padding: '40px 0' }}>Carregando...</div>
              ) : books.length === 0 ? (
                <div className="empty">
                  <div style={{ fontSize: 36, marginBottom: 12 }}>📝</div>
                  <p style={{ marginBottom: 16 }}>Você ainda não publicou nenhum livro.</p>
                  <button className="btn-primary" onClick={openCreate}>Criar primeiro livro</button>
                </div>
              ) : (
                <div className="bk-grid">
                  {books.map((book, i) => (
                    <div key={book._id} className="bk-card" style={{ animationDelay: `${i*.07}s` }}>
                      <span className="bk-subj" style={{ background:'rgba(99,102,241,.1)', color:'#a5b4fc' }}>{book.subject}</span>
                      <h3 className="bk-title">{book.title}</h3>
                      <div className="bk-meta">🧙 {book.characterName} · {book.nodes?.length || 0} cenas</div>
                      <div className="bk-actions">
                        <button className="btn-edit" onClick={() => openEdit(book)}>✏ Editar</button>
                        <button className="btn-danger" onClick={() => setDeleteId(book._id)}>🗑 Excluir</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── CRIAR / EDITAR ── */}
          {(view === 'create' || view === 'edit') && (
            <>
              <div className="ap-header">
                <div>
                  <h2 className="ap-title">{view === 'edit' ? 'Editar livro' : 'Novo livro'}</h2>
                  <p className="ap-sub">Preencha as informações e adicione as cenas</p>
                </div>
                <button className="btn-ghost" onClick={() => setView('list')}>← Voltar</button>
              </div>

              {msg && <div className={`ap-msg ${msg.type}`}>{msg.text}</div>}

              <div className="form-card" style={{ marginBottom: 24 }}>
                <div style={{ fontFamily:'Lora,serif', fontSize:16, color:'#f1f0ff', marginBottom:20, fontWeight:600 }}>📖 Informações do livro</div>
                <div className="form-row">
                  <div className="form-field" style={{ marginBottom: 0 }}>
                    <label className="form-label">Título do livro</label>
                    <input className="form-input" placeholder="Ex: Introdução à Programação" value={form.title} onChange={e => updateForm('title', e.target.value)} />
                  </div>
                  <div className="form-field" style={{ marginBottom: 0 }}>
                    <label className="form-label">Área / Matéria</label>
                    <select className="form-input" value={form.subject} onChange={e => updateForm('subject', e.target.value)}>
                      <option value="">Selecione...</option>
                      {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-field" style={{ marginBottom: 0, marginTop: 16 }}>
                  <label className="form-label">Nome do personagem guia</label>
                  <input className="form-input" placeholder="Ex: Kael, o Arquimago" value={form.characterName} onChange={e => updateForm('characterName', e.target.value)} />
                </div>
              </div>

              {/* Cenas */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                  <div style={{ fontFamily:'Lora,serif', fontSize:16, color:'#f1f0ff', fontWeight:600 }}>🗂 Cenas ({form.nodes.length})</div>
                  <button className="btn-ghost" onClick={addNode}>+ Adicionar cena</button>
                </div>

                {form.nodes.map((node, i) => (
                  <div key={node.id} className="node-card">
                    <div className="node-header">
                      <span className="node-label">Cena {i + 1}</span>
                      {form.nodes.length > 1 && (
                        <button className="node-remove" onClick={() => removeNode(i)} title="Remover cena">×</button>
                      )}
                    </div>

                    <div className="form-field">
                      <label className="form-label">Título da cena</label>
                      <input className="form-input" placeholder="Ex: Variáveis em Python" value={node.title} onChange={e => updateNode(i, 'title', e.target.value)} />
                    </div>

                    <div className="form-field">
                      <label className="form-label">Narrativa do personagem</label>
                      <textarea className="form-textarea" placeholder="O que o personagem diz nesta cena para introduzir o conteúdo..." value={node.storyText} onChange={e => updateNode(i, 'storyText', e.target.value)} rows={3} />
                    </div>

                    <div className="form-field" style={{ marginBottom: 8 }}>
                      <label className="form-label">Pergunta do desafio</label>
                      <textarea className="form-textarea" placeholder="Pergunta que a IA vai avaliar..." value={node.challengeQuestion} onChange={e => updateNode(i, 'challengeQuestion', e.target.value)} rows={2} />
                    </div>

                    <div className="expected-box">
                      <div className="expected-label">💡 Gabarito de referência (opcional)</div>
                      <textarea
                        className="form-textarea"
                        style={{ background:'transparent', border:'none', padding:'4px 0', minHeight:60 }}
                        placeholder="Escreva a resposta esperada. A IA vai usar como referência para avaliar os alunos com mais precisão..."
                        value={node.expectedAnswer}
                        onChange={e => updateNode(i, 'expectedAnswer', e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display:'flex', gap:12, justifyContent:'flex-end' }}>
                <button className="btn-ghost" onClick={() => setView('list')}>Cancelar</button>
                <button className="btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? 'Salvando...' : view === 'edit' ? 'Salvar alterações' : 'Publicar livro'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal de confirmação de exclusão */}
      {deleteId && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Excluir livro?</h3>
            <p>Esta ação é permanente. Os leitores perderão o acesso e o progresso deles neste livro será afetado.</p>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setDeleteId(null)}>Cancelar</button>
              <button className="btn-danger" onClick={() => handleDelete(deleteId)}>Sim, excluir</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
