import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function LofiRadio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // Lofi Girl Live Stream ID: jfKfPfyJRdk
  // Note: Standard iframe with "?autoplay" requires user interaction first due to browser policies.
  
  return (
    <motion.div 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 20 }}
      style={{
        position: 'fixed',
        bottom: 20,
        left: 20,
        zIndex: 50,
        background: 'rgba(15, 10, 20, 0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(168, 85, 247, 0.3)',
        borderRadius: 16,
        padding: isExpanded ? '16px' : '10px 16px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.5), inset 0 0 15px rgba(168,85,247,0.1)',
        display: 'flex',
        flexDirection: isExpanded ? 'column' : 'row',
        alignItems: 'center',
        gap: 12,
        width: isExpanded ? 240 : 'auto',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>🎧</span>
          <span style={{ color: '#fff', fontSize: 12, fontWeight: 800, letterSpacing: 1, fontFamily: 'Outfit' }}>
            LO-FI FOCUS
          </span>
        </div>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ background: 'none', border: 'none', color: '#a855f7', cursor: 'pointer', padding: 4 }}
        >
          {isExpanded ? '▼' : '▲'}
        </button>
      </div>

      {isExpanded && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          {/* Animated Visualizer */}
          <div style={{ display: 'flex', gap: 4, height: 24, alignItems: 'flex-end', opacity: isPlaying ? 1 : 0.3, transition: 'opacity 0.3s' }}>
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                animate={isPlaying ? { height: [4, 16, 8, 20, 6, 24][Math.floor(Math.random() * 6)] } : { height: 4 }}
                transition={{ repeat: Infinity, duration: 0.5 + (Math.random() * 0.5), ease: "easeInOut" }}
                style={{ width: 6, background: 'linear-gradient(to top, #ec4899, #a855f7)', borderRadius: 3 }}
              />
            ))}
          </div>

          <div style={{ position: 'relative', width: '100%', height: 80, borderRadius: 8, overflow: 'hidden' }}>
            <iframe
              width="100%"
              height="80"
              src={`https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=${isPlaying ? 1 : 0}&controls=0&disablekb=1&fs=0&modestbranding=1`}
              title="Lofi Radio"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              style={{ pointerEvents: 'none', transform: 'scale(1.5)' }}
            />
            {/* Overlay to block iframe clicks */}
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(168,85,247,0.1)' }} />
          </div>

          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              width: '100%', background: isPlaying ? 'rgba(236,72,153,0.15)' : 'linear-gradient(90deg, #ec4899, #a855f7)',
              border: isPlaying ? '1px solid rgba(236,72,153,0.3)' : 'none',
              color: isPlaying ? '#fce7f3' : '#fff', padding: '10px 0', borderRadius: 8,
              fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: isPlaying ? 'none' : '0 4px 15px rgba(236,72,153,0.4)', fontFamily: 'Inter'
            }}
          >
            {isPlaying ? '⏸ PAUSE BEATS' : '▶ PLAY BEATS'}
          </button>
        </div>
      )}
    </motion.div>
  );
}
