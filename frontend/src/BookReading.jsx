import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from './api'

export default function BookReading() {
  const{id}=useParams(),navigate=useNavigate()
  const[book,setBook]=useState(null),[nodeIndex,setNodeIndex]=useState(0),[answer,setAnswer]=useState('')
  const[result,setResult]=useState(null),[loading,setLoading]=useState(false),[completed,setCompleted]=useState(false)
  const[sceneKey,setSceneKey]=useState(0),[xpFlash,setXpFlash]=useState(null)
  const[xp,setXp]=useState(()=>{try{return JSON.parse(localStorage.getItem('user'))?.xp||0}catch{return 0}})
  const taRef=useRef(null)

  useEffect(()=>{api.books.get(id).then(({ok,data})=>{if(!ok||!data.nodes?.length){navigate('/dashboard');return}setBook(data)})},[id,navigate])

  const handleEval=async(e)=>{
    e.preventDefault(); if(!answer.trim())return
    setLoading(true);setResult(null)
    const scene=book.nodes[nodeIndex]
    const{ok,data}=await api.evaluate(scene.challengeQuestion,answer,scene.expectedAnswer||'')
    if(ok){
      setResult(data)
      const isC=['correto','correct'].includes(data.status?.toLowerCase())
      const isP=['parcial','partial'].includes(data.status?.toLowerCase())
      if(isC||isP){
        const gain=isC?100:50
        const res=await api.user.progress({bookId:id,nodeId:scene.id,currentNode:scene.id,isCorrect:isC,status:data.status})
        if(res.ok){setXp(res.data.xpTotal);setXpFlash(`+${gain} XP`);setTimeout(()=>setXpFlash(null),2200);const u=JSON.parse(localStorage.getItem('user')||'{}');localStorage.setItem('user',JSON.stringify({...u,xp:res.data.xpTotal}))}
      }
    }else{setResult({status:'errado',feedback:'Não foi possível conectar à IA. Tente novamente.'})}
    setLoading(false)
  }

  const goNext=()=>{
    if(nodeIndex<book.nodes.length-1){setNodeIndex(i=>i+1);setAnswer('');setResult(null);setSceneKey(k=>k+1);window.scrollTo({top:0,behavior:'smooth'});setTimeout(()=>taRef.current?.focus(),600)}
    else{setCompleted(true)}
  }

  if(!book)return(<div style={{minHeight:'100dvh',background:'#faf6f0',display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{display:'flex',gap:6}}>{[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:'50%',background:'#e8ddd0',animation:`ldot .9s ${i*.15}s infinite`}}/>)}</div></div>)

  if(completed)return(<>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Nunito:wght@400;500;600;700&family=Geist+Mono:wght@500&display=swap');
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
      @keyframes scaleIn{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}
      @keyframes ldot{0%,80%,100%{transform:scale(.6);opacity:.3}40%{transform:scale(1);opacity:1}}
      @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
      .cp{min-height:100dvh;background:#faf6f0;display:flex;align-items:center;justify-content:center;font-family:'Nunito',sans-serif;position:relative;overflow:hidden;}
      .cp-bg{position:absolute;inset:0;background:radial-gradient(ellipse 60% 50% at 50% 60%,rgba(196,148,74,.08) 0%,transparent 70%);pointer-events:none;}
      .cp-rings{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;}
      .cp-ring{border-radius:50%;border:1px solid rgba(196,148,74,.08);}
      .cp-card{position:relative;text-align:center;max-width:440px;padding:0 28px;animation:scaleIn .5s cubic-bezier(.34,1.56,.64,1);}
      .cp-seal{width:88px;height:88px;border-radius:50%;border:2px solid #e8ddd0;display:flex;align-items:center;justify-content:center;margin:0 auto 28px;font-size:38px;background:#fffdf9;box-shadow:0 4px 20px rgba(90,60,30,.1);animation:float 3s ease-in-out infinite;}
      .cp-pre{font-size:11px;text-transform:uppercase;letter-spacing:.12em;color:#c4a882;margin-bottom:10px;font-weight:700;}
      .cp-title{font-family:'Playfair Display',serif;font-size:28px;font-weight:700;color:#3a2a1a;letter-spacing:-.01em;margin-bottom:10px;line-height:1.2;}
      .cp-sub{font-size:14px;color:#9a8878;line-height:1.8;margin-bottom:36px;}
      .cp-xp{font-family:'Playfair Display',serif;font-size:56px;font-weight:700;color:#3a2a1a;line-height:1;margin-bottom:4px;}
      .cp-xp-lbl{font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:#c4a882;margin-bottom:40px;font-weight:700;}
      .cp-btn{width:100%;padding:15px;background:linear-gradient(135deg,#8b5e3c,#c4944a);color:#fff8f0;border:none;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;font-family:'Nunito',sans-serif;transition:opacity .2s,transform .15s;box-shadow:0 4px 14px rgba(139,94,60,.3);}
      .cp-btn:hover{opacity:.9;transform:translateY(-1px);}
    `}</style>
    <div className="cp">
      <div className="cp-bg"/>
      <div className="cp-rings">{[400,320,240].map(s=><div key={s} className="cp-ring" style={{width:s,height:s,position:'absolute'}}/>)}</div>
      <div className="cp-card">
        <div className="cp-seal">🏆</div>
        <div className="cp-pre">Jornada concluída</div>
        <div className="cp-title">{book.title}</div>
        <div className="cp-sub">Você completou todos os desafios de <em style={{color:'#7a5a3a',fontStyle:'normal',fontWeight:700}}>{book.characterName}</em> e encerrou mais um capítulo da sua jornada.</div>
        <div className="cp-xp">{xp}</div>
        <div className="cp-xp-lbl">XP total acumulado</div>
        <button className="cp-btn" onClick={()=>navigate('/dashboard')}>Voltar à biblioteca</button>
      </div>
    </div>
  </>)

  const scene=book.nodes[nodeIndex],total=book.nodes.length
  const progress=Math.round(((nodeIndex+1)/total)*100)
  const status=result?.status?.toLowerCase()
  const isC=['correto','correct'].includes(status),isP=['parcial','partial'].includes(status),isW=result&&!isC&&!isP
  const win=3,start=Math.max(0,nodeIndex-win),end=Math.min(total-1,nodeIndex+win)

  return(<>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Nunito:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500&display=swap');
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
      @keyframes ldot{0%,80%,100%{transform:scale(.6);opacity:.3}40%{transform:scale(1);opacity:1}}
      @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
      @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
      @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
      @keyframes xpPop{0%{opacity:0;transform:translateY(0) scale(.8)}20%{opacity:1;transform:translateY(-8px) scale(1.1)}80%{opacity:1;transform:translateY(-16px)}100%{opacity:0;transform:translateY(-28px)}}
      @keyframes resultIn{from{opacity:0;transform:translateY(10px) scale(.99)}to{opacity:1;transform:none}}
      @keyframes charIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:none}}
      .rr{min-height:100dvh;background:#faf6f0;font-family:'Nunito',sans-serif;color:#7a6a5a;}
      .rt{display:flex;align-items:center;gap:16px;padding:0 48px;height:60px;border-bottom:1px solid #e8ddd0;position:sticky;top:0;background:rgba(250,246,240,.97);backdrop-filter:blur(12px);z-index:20;box-shadow:0 1px 0 rgba(90,60,30,.06);}
      .rt-back{display:flex;align-items:center;gap:6px;background:none;border:none;color:#c4a882;font-size:12px;cursor:pointer;font-family:'Nunito',sans-serif;padding:0;font-weight:600;transition:color .2s;white-space:nowrap;}
      .rt-back:hover{color:#7a5a3a;}
      .rt-pw{flex:1;}
      .rt-ph{display:flex;justify-content:space-between;margin-bottom:6px;}
      .rt-pt{font-size:12px;color:#3a2a1a;font-weight:700;font-family:'Playfair Display',serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:320px;}
      .rt-pi{font-family:'Geist Mono',monospace;font-size:11px;color:#c4a882;}
      .rt-track{height:3px;background:#f0e8dd;border-radius:2px;overflow:hidden;}
      .rt-fill{height:100%;background:linear-gradient(90deg,#8b5e3c,#c4944a);border-radius:2px;transition:width .6s cubic-bezier(.4,0,.2,1);}
      .rt-xpw{position:relative;}
      .rt-xp{font-family:'Geist Mono',monospace;font-size:12px;color:#9a8878;border:1.5px solid #e8ddd0;padding:5px 12px;border-radius:20px;background:#fffdf9;transition:all .3s;}
      .rt-xp.flash{color:#c4944a;border-color:#c4944a;background:#fff8ee;}
      .rt-xppop{position:absolute;top:-2px;right:0;font-family:'Geist Mono',monospace;font-size:11px;font-weight:700;color:#c4944a;animation:xpPop 2.2s forwards;pointer-events:none;white-space:nowrap;}
      .rb{max-width:700px;margin:0 auto;padding:52px 48px 120px;}
      .rm{display:flex;align-items:center;gap:5px;margin-bottom:52px;}
      .rmd{width:26px;height:26px;border-radius:50%;border:1.5px solid #e8ddd0;display:flex;align-items:center;justify-content:center;font-family:'Geist Mono',monospace;font-size:9px;color:#e0d4c4;flex-shrink:0;transition:all .35s cubic-bezier(.4,0,.2,1);background:#fffdf9;}
      .rmd.done{background:#f5ede0;border-color:#d4c4b0;color:#c4a882;}
      .rmd.cur{background:linear-gradient(135deg,#8b5e3c,#c4944a);border-color:#c4944a;color:#fff8f0;box-shadow:0 0 0 4px rgba(196,148,74,.15);}
      .rml{flex:1;height:1.5px;background:#e8ddd0;transition:background .35s;max-width:24px;}
      .rml.done{background:#d4c4b0;}
      .rme{font-family:'Geist Mono',monospace;font-size:10px;color:#e0d4c4;padding:0 3px;}
      .rsc{animation:slideUp .45s cubic-bezier(.4,0,.2,1);}
      .rtag{display:inline-flex;align-items:center;gap:7px;font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:#c4a882;margin-bottom:10px;font-weight:700;}
      .rtag-dot{width:5px;height:5px;border-radius:50%;background:#c4944a;}
      .rtitle{font-family:'Playfair Display',serif;font-size:clamp(24px,3vw,34px);font-weight:700;color:#3a2a1a;letter-spacing:-.01em;line-height:1.2;margin-bottom:40px;}
      .rchar{display:flex;gap:16px;align-items:flex-start;margin-bottom:40px;animation:charIn .5s .1s cubic-bezier(.4,0,.2,1) both;}
      .rchar-av{width:48px;height:48px;border-radius:50%;border:2px solid #e8ddd0;background:#fffdf9;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:22px;box-shadow:0 2px 10px rgba(90,60,30,.1);position:relative;}
      .rchar-av::after{content:'';position:absolute;inset:-4px;border-radius:50%;border:1.5px solid #e8c87a;opacity:.3;}
      .rchar-bub{flex:1;background:#fffdf9;border:1.5px solid #e8ddd0;border-radius:0 16px 16px 16px;padding:20px 22px;position:relative;box-shadow:0 2px 8px rgba(90,60,30,.06);}
      .rchar-bub::before{content:'';position:absolute;left:-8px;top:16px;width:7px;height:7px;background:#fffdf9;border-left:1.5px solid #e8ddd0;border-bottom:1.5px solid #e8ddd0;transform:rotate(45deg);}
      .rchar-name{font-size:10px;font-weight:700;color:#c4a882;text-transform:uppercase;letter-spacing:.1em;margin-bottom:10px;}
      .rchar-text{font-size:15px;line-height:1.9;color:#7a6a5a;font-style:italic;}
      .rdiv{height:1px;background:linear-gradient(90deg,transparent,#e8ddd0 30%,#e8ddd0 70%,transparent);margin:36px 0;}
      .rch{border:1.5px solid #e8ddd0;border-radius:16px;padding:24px;margin-bottom:22px;animation:fadeUp .4s .15s cubic-bezier(.4,0,.2,1) both;background:#fffdf9;box-shadow:0 2px 8px rgba(90,60,30,.06);position:relative;overflow:hidden;}
      .rch::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#8b5e3c,#c4944a,#e8c87a);}
      .rch-lbl{display:flex;align-items:center;gap:7px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#c4a882;margin-bottom:14px;}
      .rch-pulse{width:6px;height:6px;border-radius:50%;background:#c4944a;animation:ldot 2s infinite;}
      .rch-q{font-size:15px;color:#3a2a1a;line-height:1.75;font-weight:500;}
      .rform{display:flex;flex-direction:column;gap:10px;animation:fadeUp .4s .2s cubic-bezier(.4,0,.2,1) both;}
      .rta{width:100%;padding:16px;background:#fffdf9;border:1.5px solid #e8ddd0;border-radius:12px;font-size:14px;color:#3a2a1a;font-family:'Nunito',sans-serif;resize:vertical;min-height:110px;outline:none;transition:border-color .2s,box-shadow .2s;line-height:1.75;box-shadow:inset 0 1px 3px rgba(90,60,30,.04);}
      .rta:focus{border-color:#c4a882;box-shadow:0 0 0 3px rgba(196,168,130,.12),inset 0 1px 3px rgba(90,60,30,.04);}
      .rta::placeholder{color:#d4c4b0;}
      .rsub{padding:14px;background:linear-gradient(135deg,#8b5e3c,#c4944a);color:#fff8f0;border:none;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer;font-family:'Nunito',sans-serif;transition:opacity .2s,transform .15s;box-shadow:0 4px 12px rgba(139,94,60,.3);letter-spacing:.01em;}
      .rsub:hover:not(:disabled){opacity:.9;transform:translateY(-1px);}
      .rsub:active:not(:disabled){transform:scale(.98) translateY(0);}
      .rsub:disabled{opacity:.35;cursor:not-allowed;box-shadow:none;}
      .rload{height:3px;border-radius:2px;background:linear-gradient(90deg,#f0e8dd,#c4944a,#f0e8dd);background-size:200% 100%;animation:shimmer 1.2s infinite;}
      .rhint{text-align:center;font-size:11px;color:#d4c4b0;font-weight:500;}
      .rres{margin-top:16px;padding:22px 24px;border-radius:14px;border-width:1.5px;border-style:solid;animation:resultIn .35s cubic-bezier(.4,0,.2,1);}
      .rres-h{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
      .rres-b{display:flex;align-items:center;gap:8px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;}
      .rres-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;}
      .rres-xp{font-family:'Geist Mono',monospace;font-size:12px;font-weight:700;}
      .rres-text{font-size:14px;line-height:1.8;color:#7a6a5a;}
      .rres-div{height:1px;background:#f0e8dd;margin:16px 0;}
      .rres-sub{font-size:13px;color:#9a8878;margin-bottom:14px;line-height:1.6;}
      .ract{width:100%;padding:12px;border-radius:10px;border:1.5px solid #e8ddd0;background:#fffdf9;font-size:13px;font-weight:700;cursor:pointer;font-family:'Nunito',sans-serif;color:#7a5a3a;transition:all .2s;}
      .ract:hover{background:#f5ede0;border-color:#c4a882;color:#3a2a1a;}
      @media(max-width:767px){.rt,.rb{padding-left:20px;padding-right:20px;}.rb{padding-top:36px;}}
    `}</style>

    <div className="rr">
      <div className="rt">
        <button className="rt-back" onClick={()=>navigate('/dashboard')}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Biblioteca
        </button>
        <div className="rt-pw">
          <div className="rt-ph">
            <span className="rt-pt">{book.title}</span>
            <span className="rt-pi">{nodeIndex+1}/{total}</span>
          </div>
          <div className="rt-track"><div className="rt-fill" style={{width:`${progress}%`}}/></div>
        </div>
        <div className="rt-xpw">
          <div className={`rt-xp ${xpFlash?'flash':''}`}>{xp} XP</div>
          {xpFlash&&<div className="rt-xppop">{xpFlash}</div>}
        </div>
      </div>

      <div className="rb">
        <div className="rm">
          {start>0&&<span className="rme">1…{start}</span>}
          {Array.from({length:end-start+1},(_,i)=>start+i).map(i=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:5}}>
              <div className={`rmd ${i<nodeIndex?'done':i===nodeIndex?'cur':''}`}>{i+1}</div>
              {i<end&&<div className={`rml ${i<nodeIndex?'done':''}`}/>}
            </div>
          ))}
          {end<total-1&&<span className="rme">{end+2}…{total}</span>}
          <span style={{marginLeft:'auto',fontFamily:"'Geist Mono',monospace",fontSize:11,color:'#d4c4b0'}}>{progress}%</span>
        </div>

        <div className="rsc" key={sceneKey}>
          <div className="rtag"><div className="rtag-dot"/>{book.subject} · Cena {nodeIndex+1}</div>
          <h1 className="rtitle">{scene.title}</h1>

          <div className="rchar">
            <div className="rchar-av">🧙</div>
            <div className="rchar-bub">
              <div className="rchar-name">{book.characterName}</div>
              <div className="rchar-text">{scene.storyText}</div>
            </div>
          </div>

          <div className="rdiv"/>

          <div className="rch">
            <div className="rch-lbl"><div className="rch-pulse"/>Desafio</div>
            <div className="rch-q">{scene.challengeQuestion}</div>
          </div>

          {!result?(
            <div className="rform" key={`f-${sceneKey}`}>
              {loading&&<div className="rload"/>}
              <textarea ref={taRef} className="rta" placeholder="Escreva sua resposta aqui..." value={answer} onChange={e=>setAnswer(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&e.ctrlKey)handleEval(e)}} disabled={loading}/>
              <button className="rsub" onClick={handleEval} disabled={loading||!answer.trim()}>{loading?'Avaliando...':'Enviar resposta'}</button>
              <div className="rhint">Ctrl + Enter para enviar</div>
            </div>
          ):(()=>{
            const cfg=isC
              ?{border:'#c4d4a8',bg:'#f8fdf0',dot:'#5a8a2a',label:'Correto',xp:'+100 XP'}
              :isP
              ?{border:'#e8c87a',bg:'#fffbee',dot:'#b5850a',label:'Parcial',xp:'+50 XP'}
              :{border:'#e8d0c4',bg:'#fff8f5',dot:'#b05a3a',label:'Incorreto',xp:''}
            return(
              <div className="rres" style={{borderColor:cfg.border,background:cfg.bg}}>
                <div className="rres-h">
                  <div className="rres-b" style={{color:cfg.dot}}><div className="rres-dot" style={{background:cfg.dot}}/>{cfg.label}</div>
                  {cfg.xp&&<span className="rres-xp" style={{color:cfg.dot}}>{cfg.xp}</span>}
                </div>
                <div className="rres-text">{result.feedback}</div>
                {(isC||isP)&&(<>
                  <div className="rres-div"/>
                  <div className="rres-sub">{nodeIndex===total-1?'Você completou este livro.':'Pronto para a próxima cena?'}</div>
                  <button className="ract" onClick={goNext}>{nodeIndex===total-1?'Concluir jornada':'Próxima cena'} →</button>
                </>)}
                {isW&&(<>
                  <div className="rres-div"/>
                  <div className="rres-sub">Releia o enunciado e tente uma abordagem diferente.</div>
                  <button className="ract" onClick={()=>{setResult(null);setAnswer('')}}>Tentar novamente</button>
                </>)}
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  </>)
}
