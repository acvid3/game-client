'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components'
import { playRoll, playWin, playLose, playJackpot, playDeal, playCashout, playMatch, playSpin, playTick } from '@/utils/sounds';
import { GameLayout, GameSection, Legend, LegendTitle, LegendItem, LegendLabel, LegendValue } from './GameLegend';

const ReelsRow = styled.div`
  display: flex;
  gap: 6px;
  justify-content: center;
  margin: 24px 0;
`;

const Reel = styled(motion.div)`
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  overflow: hidden;
`;

const Button = styled(motion.button)`
  background: rgba(99, 102, 241, 0.12);
  border: 1px solid rgba(99, 102, 241, 0.3);
  padding: 14px 40px;
  color: #e0e0e0;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: background 0.2s, border-color 0.2s;
  &:hover { background: rgba(99, 102, 241, 0.18); border-color: rgba(99, 102, 241, 0.5); }
`;

const ResultBox = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  padding: 20px;
  margin: 16px auto;
  max-width: 300px;
`;

const WinText = styled.div<{ $mult: number }>`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${p => p.$mult >= 10 ? '#f59e0b' : '#818cf8'};
`;

const SYMBOLS = [
  { icon: '🍒', value: 10, mult2: 2, mult3: 5, mult4: 15, mult5: 50 },
  { icon: '🍀', value: 20, mult2: 3, mult3: 8, mult4: 25, mult5: 80 },
  { icon: '⭐', value: 40, mult2: 5, mult3: 12, mult4: 40, mult5: 120 },
  { icon: '💎', value: 80, mult2: 8, mult3: 20, mult4: 60, mult5: 200 },
  { icon: '👑', value: 150, mult2: 12, mult3: 30, mult4: 100, mult5: 500 },
];

const REEL_ICONS = SYMBOLS.flatMap(s => Array(5).fill(s.icon));

function spinIcon(): string {
  return REEL_ICONS[Math.floor(Math.random() * REEL_ICONS.length)];
}

function countStreak(icons: string[]): { count: number; symbol: typeof SYMBOLS[0] } {
  let bestCount = 1;
  let bestIcon = icons[0];
  let current = 1;
  for (let i = 1; i < icons.length; i++) {
    if (icons[i] === icons[i - 1]) {
      current++;
      if (current > bestCount) { bestCount = current; bestIcon = icons[i]; }
    } else {
      current = 1;
    }
  }
  const counts: Record<string, number> = {};
  for (const icon of icons) counts[icon] = (counts[icon] || 0) + 1;
  let bestTotal = 0;
  let totalIcon = icons[0];
  for (const [icon, c] of Object.entries(counts)) {
    if (c > bestTotal) { bestTotal = c; totalIcon = icon; }
  }
  const streakSym = SYMBOLS.find(s => s.icon === bestIcon) || SYMBOLS[0];
  const totalSym = SYMBOLS.find(s => s.icon === totalIcon) || SYMBOLS[0];
  if (bestTotal > bestCount) return { count: bestTotal, symbol: totalSym };
  return { count: bestCount, symbol: streakSym };
}

function getWin(symbol: typeof SYMBOLS[0], count: number): { coins: number; xp: number; label: string } {
  if (count === 5) return { coins: symbol.value * symbol.mult5, xp: symbol.value, label: 'JACKPOT!' };
  if (count === 4) return { coins: symbol.value * symbol.mult4, xp: Math.floor(symbol.value * 0.4), label: 'Amazing!' };
  if (count === 3) return { coins: symbol.value * symbol.mult3, xp: Math.floor(symbol.value * 0.4), label: 'Nice!' };
  if (count === 2) return { coins: symbol.value * symbol.mult2, xp: Math.floor(symbol.value * 0.2), label: 'Small win' };
  return { coins: 0, xp: 0, label: 'No match' };
}

interface Props { onReward: (c: number, x: number) => void }

export default function LuckySpinGame({ onReward }: Props) {
  const [icons, setIcons] = useState<string[]>(['🎰', '🎰', '🎰', '🎰', '🎰']);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ coins: number; xp: number; label: string; symbol: string; count: number } | null>(null);

  const spin = async () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);
    playSpin();

    const target: string[] = [];
    const reels: string[][] = [[], [], [], [], []];

    for (let r = 0; r < 5; r++) {
      const finalIcon = spinIcon();
      target.push(finalIcon);
      for (let i = 0; i < 10; i++) {
        reels[r].push(REEL_ICONS[Math.floor(Math.random() * REEL_ICONS.length)]);
      }
      reels[r].push(finalIcon);
    }

    const spinDuration = 1500 + Math.random() * 500;
    const interval = 60;
    let elapsed = 0;

    return new Promise<void>(resolve => {
      const t = setInterval(() => {
        elapsed += interval;
        setIcons(reels.map(reel => reel[Math.floor(elapsed / (spinDuration / reel.length)) % reel.length]));
        if (elapsed >= spinDuration) {
          clearInterval(t);
          setIcons(target);
          setSpinning(false);
          const streak = countStreak(target);
          const win = getWin(streak.symbol, streak.count);
          setResult({ ...win, symbol: streak.symbol.icon, count: streak.count });
          if (win.coins > 0) {
            if (win.coins >= 1000) playJackpot(); else if (win.coins >= 100) playWin(); else playTick();
          } else playLose();
          if (win.coins > 0) onReward(win.coins, win.xp);
          resolve();
        }
      }, interval);
    });
  };

  return (
    <GameLayout>
      <GameSection>
        <ReelsRow>
          {icons.map((icon, i) => (
            <Reel key={i}>
              {icon}
            </Reel>
          ))}
        </ReelsRow>

        {result && (
          <ResultBox initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
            {result.coins > 0 ? (
              <>
                <div style={{ fontSize: '3rem' }}>{result.symbol}</div>
                <WinText $mult={result.count >= 5 ? 50 : result.count >= 4 ? 15 : result.count >= 3 ? 5 : 2}>
                  {result.label} ({result.count} in a row!)
                </WinText>
                <div>+{result.coins} coins, +{result.xp} XP</div>
              </>
            ) : (
              <div>
                <div style={{ fontSize: '2rem' }}>😢</div>
                <div>No match! Try again</div>
              </div>
            )}
          </ResultBox>
        )}

        <Button onClick={spin} disabled={spinning} whileTap={{ scale: 0.95 }}>
          {spinning ? 'Spinning...' : 'Spin!'}
        </Button>
      </GameSection>
      <Legend>
        <LegendTitle>Symbols</LegendTitle>
        {SYMBOLS.map((s, i) => (
          <LegendItem key={i}>
            <LegendLabel>{s.icon} {['🍒', '🍀', '⭐', '💎', '👑'][i] === s.icon ? '' : s.icon}</LegendLabel>
            <LegendValue>{s.value} base</LegendValue>
          </LegendItem>
        ))}
        <LegendTitle style={{ marginTop: 16, marginBottom: 8 }}>Streak</LegendTitle>
        <LegendItem><LegendLabel>2 in a row</LegendLabel><LegendValue>x2–x12</LegendValue></LegendItem>
        <LegendItem><LegendLabel>3 in a row</LegendLabel><LegendValue>x5–x30</LegendValue></LegendItem>
        <LegendItem><LegendLabel>4 in a row</LegendLabel><LegendValue>x15–x100</LegendValue></LegendItem>
        <LegendItem><LegendLabel>5 in a row</LegendLabel><LegendValue>x50–x500</LegendValue></LegendItem>
      </Legend>
    </GameLayout>
  );
}
