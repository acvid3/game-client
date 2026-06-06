'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components'
import { playRoll, playWin, playLose, playJackpot, playDeal, playCashout, playMatch, playSpin, playTick } from '@/utils/sounds';
import { GameLayout, GameSection, Legend, LegendTitle, LegendItem, LegendLabel, LegendValue, ColorDot } from './GameLegend';

const Layout = styled(GameLayout)`
  @media (max-width: 768px) { flex-direction: column; align-items: center; padding: 16px; gap: 20px; }
`;
const WheelSection = styled(GameSection)`
  @media (max-width: 768px) { 
    padding-bottom: 20px; 
    display: flex; 
    flex-direction: column; 
    align-items: center; 
  }
`;

const WheelWrap = styled.div`
  position: relative;
  width: 300px;
  height: 300px;
  margin: 0 auto;
  @media (max-width: 768px) { width: 220px; height: 220px; }
  @media (max-width: 480px) { width: 180px; height: 180px; }
`;

const Pointer = styled.div`
  position: absolute;
  top: -6px; left: 50%;
  transform: translateX(-50%);
  width: 0; height: 0;
  border-left: 14px solid transparent;
  border-right: 14px solid transparent;
  border-top: 24px solid #f59e0b;
  z-index: 2;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
`;

const Svg = styled.svg``;

const Button = styled(motion.button)`
  background: rgba(99, 102, 241, 0.12);
  border: 1px solid rgba(99, 102, 241, 0.3);
  padding: 14px 40px;
  color: #e0e0e0;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 24px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: background 0.2s, border-color 0.2s;
  &:hover { background: rgba(99, 102, 241, 0.18); border-color: rgba(99, 102, 241, 0.5); }
  @media (max-width: 768px) { margin-top: 16px; padding: 12px 32px; font-size: 1rem; }
`;

const ResultBox = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  padding: 20px;
  margin: 16px auto;
  max-width: 300px;
`;

const SEGMENTS = [
  { label: 'Jackpot', mult: 10, color: 'rgba(99, 102, 241, 0.2)' },
  { label: 'Big Win', mult: 5, color: 'rgba(129, 140, 248, 0.15)' },
  { label: 'Win', mult: 2, color: 'rgba(99, 102, 241, 0.2)' },
  { label: 'Small', mult: 1.5, color: 'rgba(129, 140, 248, 0.15)' },
  { label: 'Again', mult: 0.5, color: 'rgba(99, 102, 241, 0.2)' },
  { label: 'Lose', mult: 0, color: 'rgba(79, 70, 229, 0.12)' },
];

const PROBS = [0.02, 0.08, 0.20, 0.25, 0.25, 0.20];

interface Props { onReward: (c: number, x: number) => void }

export default function SpinWheelGame({ onReward }: Props) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<{ coins: number; xp: number; message: string } | null>(null);

  const spin = async () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);
    playSpin();
    const r = Math.random();
    let cum = 0;
    let chosen = SEGMENTS[SEGMENTS.length - 1];
    for (let i = 0; i < SEGMENTS.length; i++) {
      cum += PROBS[i];
      if (r <= cum) { chosen = SEGMENTS[i]; break; }
    }
    const idx = SEGMENTS.indexOf(chosen);
    setRotation(rotation - (rotation % 360) + 1440 - idx * (360 / SEGMENTS.length));
    await new Promise(r => setTimeout(r, 2000));
    const coins = Math.floor(20 * chosen.mult);
    const xp = Math.floor(15 * chosen.mult);
    setResult({ coins, xp, message: `x${chosen.mult}` });
    setSpinning(false);
    if (chosen.mult > 0) { if (chosen.mult >= 5) playJackpot(); else playWin(); }
    else playLose();
    if (chosen.mult >= 1) onReward(coins, xp);
  };

  const a = 360 / SEGMENTS.length;
  return (
    <Layout>
      <WheelSection>
        <WheelWrap>
          <Pointer />
          <Svg viewBox="0 0 200 200" width="300" height="300">
            <defs>
              <filter id="frost">
                <feGaussianBlur stdDeviation="6"/>
              </filter>
            </defs>
            <g style={{ transformOrigin: '100px 100px', transform: `rotate(${rotation}deg)`, transition: spinning ? 'transform 2s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none' }}>
            <circle cx="100" cy="100" r="90" fill="rgba(255, 255, 255, 0.04)" filter="url(#frost)" />
            {SEGMENTS.map((s, i) => {
              const sa = i * a - 120, ea = (i + 1) * a - 120;
              const x1 = 100 + 90 * Math.cos(sa * Math.PI / 180);
              const y1 = 100 + 90 * Math.sin(sa * Math.PI / 180);
              const x2 = 100 + 90 * Math.cos(ea * Math.PI / 180);
              const y2 = 100 + 90 * Math.sin(ea * Math.PI / 180);
              const la = a > 180 ? 1 : 0;
              return (
                <path key={i} d={`M100,100 L${x1},${y1} A90,90 0 ${la},1 ${x2},${y2} Z`} fill={s.color} stroke="#0d0d14" strokeWidth="1" />
              );
            })}
            {SEGMENTS.map((s, i) => {
              const ma = i * a - 90, rad = ma * Math.PI / 180;
              const tx = 100 + 50 * Math.cos(rad), ty = 100 + 50 * Math.sin(rad);
              const rot = ma > 90 && ma < 270 ? ma - 180 : ma;
              return (
                <text key={`t${i}`} x={tx} y={ty} textAnchor="middle" dominantBaseline="middle"
                  fill="#e2e8f0" fontSize="13" fontWeight="bold"
                  stroke="#0d0d14" strokeWidth="0.5" paintOrder="stroke"
                  transform={`rotate(${rot}, ${tx}, ${ty})`}>
                  {s.label}
                </text>
              );
            })}
            </g>
          </Svg>
        </WheelWrap>
        {result && (
          <ResultBox initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              style={{ fontSize: '2rem' }}>{result.message}</motion.div>
            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
              +{result.coins} coins, +{result.xp} XP
            </motion.div>
          </ResultBox>
        )}
        <Button onClick={spin} disabled={spinning} whileTap={{ scale: 0.95 }}>
          {spinning ? 'Spinning...' : 'Spin!'}
        </Button>
      </WheelSection>

      <Legend>
        <LegendTitle>Prizes</LegendTitle>
        {SEGMENTS.map((s, i) => (
          <LegendItem key={i} $color={s.color}>
            <ColorDot $color={s.color} />
            <LegendLabel>{s.label}</LegendLabel>
            <div>
              <LegendValue>{Math.floor(20 * s.mult)} coins / {Math.floor(15 * s.mult)} XP</LegendValue>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem', textAlign: 'right' }}>{(PROBS[i] * 100)}%</div>
            </div>
          </LegendItem>
        ))}
      </Legend>
    </Layout>
  );
}
