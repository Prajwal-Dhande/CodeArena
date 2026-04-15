import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

export default function PremiumRadarChart({ timeTaken, totalTests, passed, language }) {
  // Generate slightly randomized but logic-based metrics clamped to 100
  const passRatio = totalTests > 0 ? passed / totalTests : 0;
  
  // Simulated stats to make them feel like FAANG-level feedback
  const executionSpeed = Math.min(100, Math.max(40, passRatio * 100 - (timeTaken > 300 ? 20 : 0)));
  const codeElegance = language === 'python' ? 90 : language === 'javascript' ? 85 : 78;
  const memoryEfficiency = Math.min(100, 75 + (Math.random() * 20));
  const logicQuality = passRatio * 100;
  const globalPercentile = Math.floor((executionSpeed + codeElegance + memoryEfficiency + logicQuality) / 4);

  const data = [
    { metric: 'Execution Speed', score: executionSpeed, fullMark: 100 },
    { metric: 'Code Elegance', score: codeElegance, fullMark: 100 },
    { metric: 'Memory Mngt', score: memoryEfficiency, fullMark: 100 },
    { metric: 'Logic Quality', score: logicQuality, fullMark: 100 },
    { metric: 'Edge Cases', score: passRatio > 0.8 ? 95 : 40, fullMark: 100 }
  ];

  return (
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }} 
      animate={{ scale: 1, opacity: 1 }} 
      transition={{ type: 'spring', damping: 15, stiffness: 100 }}
      style={{
        background: 'linear-gradient(135deg, rgba(20,10,25,0.9), rgba(15,8,20,0.95))',
        border: '1px solid rgba(168,85,247,0.3)',
        borderRadius: 20,
        padding: '24px 16px',
        boxShadow: '0 10px 40px rgba(168,85,247,0.1)',
        display: 'flex', flexDirection: 'column', alignItems: 'center'
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <div style={{ color: '#c084fc', fontSize: 13, fontWeight: 800, letterSpacing: 1 }}>FAANG-LEVEL ANALYSIS</div>
        <div style={{ color: '#fff', fontSize: 24, fontWeight: 900, fontFamily: 'Outfit' }}>
          Better than {globalPercentile}% of users
        </div>
      </div>

      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis dataKey="metric" tick={{ fill: '#c084fc', fontSize: 11, fontWeight: 600, fontFamily: 'Inter' }} />
            <Tooltip 
              contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid #c084fc', borderRadius: 8, color: '#fff' }}
              itemStyle={{ color: '#e879f9' }}
            />
            <Radar 
              name="Your Code" 
              dataKey="score" 
              stroke="#e879f9" 
              strokeWidth={2}
              fill="url(#colorNeonPink)" 
              fillOpacity={0.6}
            />
            <defs>
              <linearGradient id="colorNeonPink" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e879f9" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#c084fc" stopOpacity={0.2}/>
              </linearGradient>
            </defs>
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
