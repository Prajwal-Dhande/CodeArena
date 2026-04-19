import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// 🔥 NO YOUTUBE AT ALL! Direct MP3 Links (Instant play, zero errors)
const TRACKS = [
  { name: 'Lofi Study Beats', src: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3' },
  { name: 'Chill Synthwave', src: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3' },
  { name: 'Night Jazz Hop', src: 'https://cdn.pixabay.com/download/audio/2022/11/22/audio_febc508520.mp3' },
  { name: 'Coding Flow', src: 'https://cdn.pixabay.com/download/audio/2021/09/06/audio_92440182ce.mp3' },
  { name: 'Deep Focus Ambient', src: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_24e2db5966.mp3' }
];

export default function LofiRadio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [bounds, setBounds] = useState({ right: 0, top: 0 });
  const [trackIdx, setTrackIdx] = useState(0); 
  
  const audioRef = useRef(null);

  // Screen bounds calculate karne ke liye taaki drag bahar na jaye
  useEffect(() => {
    const updateBounds = () => {
      setBounds({
        right: window.innerWidth - 280,
        top: -window.innerHeight + 150,
      });
    };
    updateBounds();
    window.addEventListener('resize', updateBounds);
    return () => window.removeEventListener('resize', updateBounds);
  }, []);

  // Track change aur play/pause sync karna
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(err => console.log("Audio play error:", err));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, trackIdx]);

  const nextTrack = () => {
    setTrackIdx((prev) => (prev === TRACKS.length - 1 ? 0 : prev + 1));
    setIsPlaying(true); // Change karne pe automatically play ho
  };

  const prevTrack = () => {
    setTrackIdx((prev) => (prev === 0 ? TRACKS.length - 1 : prev - 1));
    setIsPlaying(true);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <motion.div 
      drag 
      dragMomentum={false} 
      dragConstraints={{ left: -10, right: bounds.right, top: bounds.top, bottom: 10 }}
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
      {/* 🎵 Hidden Audio Element */}
      <audio 
        ref={audioRef} 
        src={TRACKS[trackIdx].src} 
        loop 
      />

      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          width: '100%',
          cursor: 'grab' 
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, pointerEvents: 'none' }}>
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

      <div style={{ 
        width: '100%', 
        display: isExpanded ? 'flex' : 'none', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: 12 
      }}>
        
        {/* PREMIUM CHANNEL SWITCHER */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '4px 8px' }}>
          <button onClick={prevTrack} style={{ background: 'none', border: 'none', color: '#a855f7', cursor: 'pointer', fontSize: 12, padding: 4 }}>◀</button>
          <span style={{ fontSize: 11, color: '#e2e8f0', fontWeight: 600, fontFamily: 'Inter', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140 }}>
            {TRACKS[trackIdx].name}
          </span>
          <button onClick={nextTrack} style={{ background: 'none', border: 'none', color: '#a855f7', cursor: 'pointer', fontSize: 12, padding: 4 }}>▶</button>
        </div>

        {/* CSS Animated Visualizer (Looks better than Youtube Iframe) */}
        <div style={{ 
          position: 'relative', width: '100%', height: 80, borderRadius: 8, overflow: 'hidden', 
          background: 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(236,72,153,0.1))',
          display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.05)'
        }}>
          <div style={{ display: 'flex', gap: 6, height: 40, alignItems: 'flex-end', opacity: isPlaying ? 1 : 0.3, transition: 'opacity 0.3s' }}>
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                animate={isPlaying ? { height: [8, 30, 12, 40, 10, 25][Math.floor(Math.random() * 6)] } : { height: 8 }}
                transition={{ repeat: Infinity, duration: 0.4 + (Math.random() * 0.4), ease: "easeInOut" }}
                style={{ width: 8, background: 'linear-gradient(to top, #ec4899, #a855f7)', borderRadius: 4 }}
              />
            ))}
          </div>
        </div>

        {/* Play/Pause Button */}
        <button 
          onClick={togglePlay}
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
    </motion.div>
  );
}