import React, { useState, useRef } from 'react';

const features = [
  { icon: '⚡', title: 'Real-Time Sync', desc: 'Every keystroke synced via WebSockets under 98ms. Watch your opponent code live.', color: '#ff6b35', tag: 'SOCKET.IO', size: 'large' },
  { icon: '🤖', title: 'AI Interviewer', desc: 'Mid-battle constraint injection. AI reads your logic and raises the bar.', color: '#fb923c', tag: 'LLM POWERED', size: 'small' },
  { icon: '🔒', title: 'Secure Sandbox', desc: 'All code runs in isolated Docker containers. Malicious scripts die here.', color: '#22c55e', tag: 'DOCKER', size: 'small' },
  { icon: '📊', title: 'Live Analytics', desc: 'Execution time, space complexity, test case delta — tracked in real-time.', color: '#60a5fa', tag: 'REAL-TIME', size: 'large' },
]

// 3D Tilt Card Logic
function TiltCard({ icon, title, desc, color, tag, size }) {
  const cardRef = useRef(null);
  const [style, setStyle] = useState({ transition: 'transform 0.5s ease-out' });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    
    // Calculate mouse position relative to card center
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate rotation (-10 to 10 degrees)
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: 'none', // Remove transition for smooth tracking
      zIndex: 10
    });
  };

  const handleMouseLeave = () => {
    // Snap back to original position
    setStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      zIndex: 1
    });
  };

  return (
    <div 
      ref={cardRef}
      className={`bento-card ${size}`} 
      style={{ '--hover-color': color, ...style }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="card-glow" style={{ background: color }} />
      
      <div className="card-content">
        <div className="card-top">
          <span className="feature-icon-wrapper" style={{ color }}>{icon}</span>
          <span className="feature-badge" style={{ color, borderColor: `${color}40`, background: `${color}10` }}>{tag}</span>
        </div>
        
        <h3 className="card-title">{title}</h3>
        <p className="card-desc">{desc}</p>
      </div>

      <div className="bg-watermark">{icon}</div>
    </div>
  );
}

export default function Features() {
  return (
    <section id="features" className="features-section">
      <div className="features-container">
        <div className="features-header">
          <span className="features-subtitle">SYSTEM CAPABILITIES</span>
          <h2 className="features-title">
            Engineered for <span className="text-glow">performance.</span>
          </h2>
        </div>

        <div className="bento-grid">
          {features.map((feature) => (
            <TiltCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>

      <style>{`
        /* Styles exactly as you provided, slight tweaks for 3D parent */
        .features-section { padding: 8rem 2.5rem; background: #0a0a0a; font-family: Inter, sans-serif; perspective: 1000px; }
        .features-container { max-width: 1200px; margin: 0 auto; }
        .features-header { margin-bottom: 4rem; text-align: center; }
        .features-subtitle { font-size: 12px; font-weight: 700; color: #555; letter-spacing: 3px; display: block; margin-bottom: 12px; }
        .features-title { font-family: Outfit, sans-serif; font-weight: 800; font-size: clamp(2.5rem, 4vw, 3.5rem); color: #fff; line-height: 1.1; margin: 0; letter-spacing: -1px; }
        .text-glow { color: #ff6b35; text-shadow: 0 0 30px rgba(255,107,53,0.4); }
        
        .bento-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; transform-style: preserve-3d; }
        
        .bento-card { position: relative; background: #121212; border: 1px solid #1f1f1f; border-radius: 20px; padding: 32px; overflow: hidden; display: flex; flex-direction: column; justify-content: flex-end; will-change: transform; cursor: default; }
        .bento-card.large { grid-column: span 2; min-height: 280px; }
        .bento-card.small { grid-column: span 1; min-height: 280px; }
        
        .bento-card:hover { border-color: var(--hover-color); box-shadow: 0 15px 35px rgba(0,0,0,0.4); }
        .card-glow { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 150px; height: 150px; filter: blur(80px); opacity: 0; transition: opacity 0.4s; z-index: -1; }
        .bento-card:hover .card-glow { opacity: 0.15; }
        
        .card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: auto; transform: translateZ(30px); }
        .feature-icon-wrapper { font-size: 32px; background: #1a1a1a; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; border-radius: 16px; border: 1px solid #2a2a2a; }
        .feature-badge { font-size: 10px; font-weight: 700; letter-spacing: 1px; padding: 6px 12px; border-radius: 30px; border: 1px solid; }
        
        .card-content { transform-style: preserve-3d; }
        .card-title { font-family: Outfit, sans-serif; font-weight: 700; font-size: 22px; color: #fff; margin: 30px 0 10px 0; transform: translateZ(40px); }
        .card-desc { color: #888; font-size: 14px; line-height: 1.6; margin: 0; max-width: 90%; transform: translateZ(20px); }
        
        .bg-watermark { position: absolute; bottom: -20px; right: -20px; font-size: 150px; opacity: 0.02; z-index: 0; filter: grayscale(100%); transition: all 0.4s; transform: translateZ(-10px); }
        .bento-card:hover .bg-watermark { opacity: 0.05; transform: scale(1.1) translateZ(-10px); }

        @media (max-width: 900px) {
          .bento-grid { grid-template-columns: 1fr; }
          .bento-card.large, .bento-card.small { grid-column: span 1; min-height: 240px; }
          .bento-card { transform: none !important; } /* Disable tilt on mobile */
        }
      `}</style>
    </section>
  )
}