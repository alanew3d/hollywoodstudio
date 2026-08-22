'use client';
import { useState } from 'react';

const PLANS = [
  {
    id: 'basico', name: 'Básico', priceReal: 99, priceUSD: 18,
    credits: '$6 em créditos MuAPI', badge: null,
    features: ['~100 imagens por mês','~12 vídeos de 5s','Nano Banana, Flux, Seedream, Wan','Até 1080p','Image + Video Studio','Galeria ilimitada','Suporte por e-mail'],
  },
  {
    id: 'premium', name: 'Premium', priceReal: 299, priceUSD: 55,
    credits: '$18 em créditos MuAPI', badge: 'MAIS POPULAR',
    features: ['~300 imagens por mês','~36 vídeos de 5s','Kling 3, MiniMax H3, Veo 3, Midjourney','Vídeo em 4K','Lip Sync + Cinema Studio','Workflow Studio (nodes)','Geração em lote','Suporte prioritário'],
  },
  {
    id: 'agencias', name: 'Agências', priceReal: 799, priceUSD: 145,
    credits: '$50 em créditos MuAPI', badge: 'WHITE-LABEL',
    features: ['~800 imagens por mês','~100 vídeos de 5s','Tudo do Premium','Multi-usuário (5 seats)','Design Agent + AI Influencer','Relatórios de uso','Logo da agência no painel','Suporte dedicado + onboarding'],
  },
];

export default function PlanosPage() {
  const [currency, setCurrency] = useState('BRL');
  const [loading, setLoading] = useState(null);

  const mpLinks = {
    basico:   'https://mpago.la/18S6Euq',
    premium:  'https://mpago.la/1oH3qf6',
    agencias: 'https://mpago.la/1rFDpXm',
  };

  return (
    <div style={{minHeight:'100vh',background:'#07080a',color:'#fff',paddingTop:'80px'}}>
      <div style={{textAlign:'center',padding:'0 20px 48px'}}>
        <img src="/hs-logo.png" alt="Hollywood Studio AI" style={{height:'52px',margin:'0 auto 20px',display:'block',filter:'brightness(1.1)'}} onError={e=>e.target.style.display='none'} />
        <h1 style={{fontFamily:'Georgia,serif',fontSize:'clamp(28px,5vw,42px)',fontWeight:300,marginBottom:'8px'}}>
          Planos & <span style={{color:'#c9a84c'}}>Créditos</span>
        </h1>
        <p style={{color:'#888',fontSize:'14px',marginBottom:'24px'}}>Créditos válidos para vídeo, imagem, áudio e lip sync</p>
        <div style={{display:'inline-flex',background:'#161616',border:'1px solid #222',borderRadius:'12px',padding:'3px',gap:'4px'}}>
          {['BRL','USD'].map(c=>(
            <button key={c} onClick={()=>setCurrency(c)}
              style={{padding:'8px 20px',borderRadius:'8px',border:'none',cursor:'pointer',fontSize:'13px',fontWeight:700,
                background:currency===c?'#c9a84c':'transparent',
                color:currency===c?'#000':'#888',transition:'all .15s'}}>
              {c==='BRL'?'🇧🇷 R$':'🌎 US$'}
            </button>
          ))}
        </div>
      </div>

      <div style={{maxWidth:'960px',margin:'0 auto',padding:'0 20px 80px',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:'20px'}}>
        {PLANS.map(plan=>(
          <div key={plan.id} style={{position:'relative',background:'#0e0f12',borderRadius:'20px',padding:'28px 24px',
            border:plan.badge==='MAIS POPULAR'?'1.5px solid #c9a84c':'1px solid #1e2028'}}>
            {plan.badge&&(
              <div style={{position:'absolute',top:'-14px',left:'50%',transform:'translateX(-50%)',
                background:'#c9a84c',color:'#000',fontSize:'9px',fontWeight:900,letterSpacing:'2px',
                padding:'4px 14px',borderRadius:'20px',whiteSpace:'nowrap'}}>
                {plan.badge}
              </div>
            )}
            <p style={{fontSize:'11px',fontWeight:700,color:'#666',textTransform:'uppercase',letterSpacing:'2px',marginBottom:'12px'}}>{plan.name}</p>
            <div style={{fontSize:'38px',fontWeight:300,marginBottom:'4px'}}>
              {currency==='BRL'?`R$${plan.priceReal}`:`US$${plan.priceUSD}`}
              <span style={{fontSize:'14px',color:'#555',fontWeight:400}}>/mês</span>
            </div>
            <p style={{fontSize:'11px',color:'#c9a84c',marginBottom:'24px'}}>{plan.credits}</p>
            <ul style={{listStyle:'none',padding:0,margin:'0 0 28px',display:'flex',flexDirection:'column',gap:'10px'}}>
              {plan.features.map(f=>(
                <li key={f} style={{display:'flex',gap:'8px',fontSize:'13px',color:'#bbb',lineHeight:1.4}}>
                  <span style={{color:'#c9a84c',flexShrink:0,marginTop:'1px'}}>✓</span>{f}
                </li>
              ))}
            </ul>
            <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
              <button onClick={()=>{setLoading(plan.id+'-mp');window.open(mpLinks[plan.id],'_blank');setLoading(null);}}
                style={{width:'100%',padding:'13px',borderRadius:'12px',border:'none',cursor:'pointer',
                  background:'#009ee3',color:'#fff',fontSize:'13px',fontWeight:700,transition:'opacity .15s'}}
                onMouseEnter={e=>e.target.style.opacity='.85'} onMouseLeave={e=>e.target.style.opacity='1'}>
                💳 Mercado Pago (PIX, cartão, boleto)
              </button>
              <button onClick={()=>alert('Stripe em breve — use Mercado Pago')}
                style={{width:'100%',padding:'13px',borderRadius:'12px',border:'1px solid #2a2a2a',
                  background:'transparent',color:'#aaa',fontSize:'13px',fontWeight:700,cursor:'pointer',transition:'all .15s'}}
                onMouseEnter={e=>{e.target.style.borderColor='#444';e.target.style.color='#fff'}}
                onMouseLeave={e=>{e.target.style.borderColor='#2a2a2a';e.target.style.color='#aaa'}}>
                🌎 Stripe (USD — cartão internacional)
              </button>
              <p style={{fontSize:'10px',textAlign:'center',color:'#444',paddingTop:'4px'}}>
                PIX instantâneo • Boleto • PayPal • Parcelado
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
