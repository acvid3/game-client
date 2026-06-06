'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components'
import { FaGem, FaMoon, FaFlask, FaCrown, FaQuestion } from 'react-icons/fa';
import { playRoll, playWin, playLose, playJackpot, playDeal, playCashout, playMatch, playSpin, playTick } from '@/utils/sounds';
import { GameLayout, GameSection, Legend, LegendTitle, LegendItem, LegendLabel, LegendValue } from './GameLegend';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  max-width: 320px;
  margin: 16px auto;
`;

const Item = styled(motion.button)<{ $sel: boolean }>`
  aspect-ratio: 1;
  border: 2px solid ${p => p.$sel ? '#f59e0b' : 'rgba(255, 255, 255, 0.08)'};
  background: ${p => p.$sel ? 'rgba(255,215,0,0.2)' : 'rgba(255, 255, 255, 0.03)'};
  color: #e0e0e0;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  &:hover { background: rgba(99, 102, 241, 0.18); border-color: rgba(99, 102, 241, 0.5); }
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 0.8rem;
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

const ITEMS = [
  { id: 'crystal', name: 'Crystal', rarity: 'common' as const, value: 10, icon: <FaGem /> },
  { id: 'gem', name: 'Gem', rarity: 'rare' as const, value: 25, icon: <FaMoon /> },
  { id: 'relic', name: 'Relic', rarity: 'epic' as const, value: 50, icon: <FaFlask /> },
  { id: 'artifact', name: 'Artifact', rarity: 'legendary' as const, value: 100, icon: <FaCrown /> },
];

const RARITY_MULT = { common: 1, rare: 2, epic: 3, legendary: 5 };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface Props { onReward: (c: number, x: number) => void }

export default function CollectionMatchGame({ onReward }: Props) {
  const [grid, setGrid] = useState(() => {
    const pool = shuffle([...ITEMS, ...ITEMS]);
    return pool.map((item, i) => ({ ...item, index: i, sel: false, match: false }));
  });
  const [sel, setSel] = useState<number[]>([]);
  const [msg, setMsg] = useState('');

  const handle = (idx: number) => {
    if (grid[idx].match || sel.length >= 2 || sel.includes(idx)) return;
    const next = grid.map((c, i) => i === idx ? { ...c, sel: true } : c);
    const ns = [...sel, idx];
    setGrid(next); setSel(ns);
    if (ns.length === 2) {
      const [a, b] = ns;
      if (next[a].id === next[b].id) {
        setTimeout(() => {
          setGrid(g => g.map((c, i) => i === a || i === b ? { ...c, match: true, sel: false } : c));
          setSel([]);
          const mult = RARITY_MULT[next[a].rarity];
          const coins = next[a].value * mult;
          const xp = Math.floor(next[a].value / 2 * mult);
          setMsg(`Matched ${next[a].name}! +${Math.floor(coins)} coins`);
          playMatch();
          onReward(Math.floor(coins), Math.floor(xp));
        }, 400);
      } else {
        setTimeout(() => {
          setGrid(g => g.map((c, i) => i === a || i === b ? { ...c, sel: false } : c));
          setSel([]);
        }, 600);
      }
    }
  };

  const reset = () => {
    const pool = shuffle([...ITEMS, ...ITEMS]);
    setGrid(pool.map((item, i) => ({ ...item, index: i, sel: false, match: false })));
    setSel([]); setMsg('');
  };

  return (
    <GameLayout>
      <GameSection>
        <div style={{ color: '#94a3b8', marginBottom: 8 }}>Match pairs of collectible items!</div>
        {msg && <ResultBox initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{msg}</ResultBox>}
        <Grid>
          {grid.map((item, i) => (
            <Item key={i} $sel={item.sel}
              onClick={() => handle(i)} whileTap={{ scale: 0.9 }}
              style={{ opacity: item.match ? 0.3 : 1 }}>
              <div style={{ fontSize: '1.2rem', color: '#818cf8', lineHeight: 1 }}>{item.sel || item.match ? item.icon : <FaQuestion />}</div>
              <div>{item.sel || item.match ? item.name : ''}</div>
            </Item>
          ))}
        </Grid>
        <Button onClick={reset} whileTap={{ scale: 0.95 }}>Reset</Button>
      </GameSection>
      <Legend>
        <LegendTitle>Items</LegendTitle>
        {ITEMS.map((item, i) => (
          <LegendItem key={i}>
            <LegendLabel><span style={{ color: '#818cf8', marginRight: 4 }}>{item.icon}</span> {item.name}</LegendLabel>
            <LegendValue>{item.value} coins</LegendValue>
          </LegendItem>
        ))}
        <LegendTitle style={{ marginTop: 16, marginBottom: 8 }}>Rarity bonus</LegendTitle>
        <LegendItem><LegendLabel>Common</LegendLabel><LegendValue>x1</LegendValue></LegendItem>
        <LegendItem><LegendLabel>Rare</LegendLabel><LegendValue>x2</LegendValue></LegendItem>
        <LegendItem><LegendLabel>Epic</LegendLabel><LegendValue>x3</LegendValue></LegendItem>
        <LegendItem><LegendLabel>Legendary</LegendLabel><LegendValue>x5</LegendValue></LegendItem>
      </Legend>
    </GameLayout>
  );
}
