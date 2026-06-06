'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components'
import { playRoll, playWin, playLose, playJackpot, playDeal, playCashout, playMatch, playSpin, playTick } from '@/utils/sounds';
import { GameLayout, GameSection, Legend, LegendTitle, LegendItem, LegendLabel, LegendValue } from './GameLegend';

const DiceBox = styled.div`
  display: flex;
  gap: 24px;
  justify-content: center;
  margin: 32px 0;
`;

const Dice = styled(motion.div)`
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 600;
  color: #e2e8f0;
`;

const Button = styled(motion.button)`
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.3);
  padding: 14px 40px;
  color: #e0e0e0;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  &:hover { background: rgba(99, 102, 241, 0.18); border-color: rgba(99, 102, 241, 0.5); }
`;

const ResultBox = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  padding: 20px;
  margin: 16px auto;
  max-width: 300px;
`;

const PRIZES = [
  { label: '2 or 12', mult: 'x5', reward: '100 coins / 50 XP' },
  { label: '7', mult: 'x3', reward: '60 coins / 30 XP' },
  { label: '8-10', mult: 'x1.5', reward: '30 coins / 15 XP' },
  { label: '3-6, 11', mult: 'x0.5', reward: '10 coins / 5 XP' },
];

interface Props {
  onReward: (coins: number, xp: number) => void;
}

export default function DiceRollGame({ onReward }: Props) {
  const [dice, setDice] = useState<[number, number] | null>(null);
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState<{ coins: number; xp: number; message: string } | null>(null);

  const roll = async () => {
    setRolling(true);
    setResult(null);
    playRoll(600);
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    setDice([d1, d2]);
    await new Promise(r => setTimeout(r, 600));

    const total = d1 + d2;
    let mult = 0.5;
    let msg = 'Better luck next time!';
    if (total === 2 || total === 12) { mult = 5; msg = 'JACKPOT!'; }
    else if (total === 7) { mult = 3; msg = 'Lucky seven!'; }
    else if (total >= 8 && total <= 10) { mult = 1.5; msg = 'Good roll!'; }

    const coins = Math.floor(20 * mult);
    const xp = Math.floor(10 * mult);
    setRolling(false);
    setResult({ coins, xp, message: msg });
    if (coins > 0) playWin(); else playLose();
    onReward(coins, xp);
  };

  return (
    <GameLayout>
      <GameSection>
        <DiceBox>
          {[0, 1].map(i => (
            <Dice
              key={i}
              animate={rolling ? { rotate: [0, 360, 720], scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.6 }}
            >
              {dice ? ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][(dice[i] || 1) - 1] : '🎲'}
            </Dice>
          ))}
        </DiceBox>
        {result && (
          <ResultBox initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>{result.message}</div>
            <div>+{result.coins} coins, +{result.xp} XP</div>
          </ResultBox>
        )}
        <Button onClick={roll} disabled={rolling} whileTap={{ scale: 0.95 }}>
          {rolling ? 'Rolling...' : 'Roll Dice'}
        </Button>
      </GameSection>
      <Legend>
        <LegendTitle>Payouts</LegendTitle>
        {PRIZES.map((p, i) => (
          <LegendItem key={i}>
            <LegendLabel>{p.label} — {p.mult}</LegendLabel>
            <LegendValue>{p.reward}</LegendValue>
          </LegendItem>
        ))}
      </Legend>
    </GameLayout>
  );
}
