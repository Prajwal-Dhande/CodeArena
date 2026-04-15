import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function VisualFlowHint() {
  const [step, setStep] = useState(0);

  // Simple two pointer simulation on an array [2, 7, 11, 15] for Two Sum or similar logic
  const array = [2, 7, 11, 15];
  const steps = [
    { i: 0, j: 3, msg: "Initialize left pointer at start, right at end.", match: false },
    { i: 0, j: 2, msg: "Sum is 17 (too large). Move right pointer left.", match: false },
    { i: 0, j: 1, msg: "Sum is 9. Target found!", match: true },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % steps.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const current = steps[step];

  return (
    <div style={{
      background: 'rgba(20, 10, 30, 0.6)',
      border: '1px solid rgba(168,85,247,0.3)',
      borderRadius: 12,
      padding: '20px',
      marginTop: '16px',
      overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 18 }}>👁️</span>
        <span style={{ color: '#e879f9', fontSize: 11, fontWeight: 800, letterSpacing: 1 }}>VISUAL EXECUTION (TWO-POINTER)</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', position: 'relative', height: 60, alignItems: 'center' }}>
        {array.map((num, idx) => {
          const isI = current.i === idx;
          const isJ = current.j === idx;
          const isMatch = (isI || isJ) && current.match;
          
          return (
            <motion.div
              key={idx}
              animate={{
                scale: isI || isJ ? 1.1 : 1,
                borderColor: isMatch ? '#22c55e' : (isI ? '#3b82f6' : isJ ? '#ef4444' : 'rgba(255,255,255,0.1)'),
                boxShadow: isMatch ? '0 0 20px rgba(34,197,94,0.4)' : 'none'
              }}
              style={{
                width: 48, height: 48, background: 'rgba(255,255,255,0.05)',
                border: '2px solid rgba(255,255,255,0.1)', borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 16, fontWeight: 700, fontFamily: 'JetBrains Mono',
                position: 'relative'
              }}
            >
              {num}
              {isI && (
                <motion.div layoutId="pointer-i" style={{ position: 'absolute', bottom: -24, color: '#3b82f6', fontSize: 12, fontWeight: 800 }}>
                  ↑ i
                </motion.div>
              )}
              {isJ && (
                <motion.div layoutId="pointer-j" style={{ position: 'absolute', top: -24, color: '#ef4444', fontSize: 12, fontWeight: 800 }}>
                  ↓ j
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div style={{ marginTop: 24, textAlign: 'center', color: current.match ? '#4ade80' : '#d8b4fe', fontSize: 13, minHeight: 20 }}>
        <motion.span key={step} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
          {current.msg}
        </motion.span>
      </div>
    </div>
  );
}
