import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        .nf-root {
          min-height: 100vh; background: #0d0f14;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          font-family: 'DM Sans', sans-serif; color: #666980;
          text-align: center; gap: 16px;
        }
        .nf-code {
          font-family: 'Lora', serif; font-size: 96px;
          font-weight: 600; color: #1e2030; line-height: 1;
          margin: 0;
        }
        .nf-title { font-family: 'Lora', serif; font-size: 22px; color: #f1f0ff; margin: 0; }
        .nf-sub { font-size: 14px; color: #4a4d60; margin: 0; }
        .nf-btn {
          margin-top: 8px; padding: 11px 24px;
          background: linear-gradient(135deg, #7c3aed, #6366f1);
          color: white; border: none; border-radius: 10px;
          font-size: 14px; font-weight: 500; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
        }
        .nf-btn:hover { opacity: 0.88; }
      `}</style>
      <div className="nf-root">
        <p className="nf-code">404</p>
        <h1 className="nf-title">Página não encontrada</h1>
        <p className="nf-sub">Este caminho não existe no mapa da jornada.</p>
        <button className="nf-btn" onClick={() => navigate('/')}>Voltar ao início</button>
      </div>
    </>
  )
}
