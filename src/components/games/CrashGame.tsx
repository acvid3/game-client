'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components'
import { playRoll, playWin, playLose, playJackpot, playDeal, playCashout, playMatch, playSpin, playTick } from '@/utils/sounds';

const Container = styled.div`
  text-align: center;
  padding: 32px;
`;

const Multiplier = styled(motion.div)`
  font-size: 4rem;
  font-weight: 600;
  color: #818cf8;
  margin: 24px 0;
`;

const MultiplierCrashed = styled.div`
  font-size: 3rem;
  font-weight: 600;
  color: #ef4444;
  margin: 24px 0;
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

const CashoutBtn = styled(Button)`
  background: rgba(99, 102, 241, 0.18);
  border-color: rgba(99, 102, 241, 0.5);
`;

const BetRow = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
  margin: 16px 0;
`;

const Chip = styled(motion.button)<{ $active?: boolean }>`
  background: ${p => p.$active ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.05)'};
  border: 2px solid ${p => p.$active ? 'rgba(245, 158, 11, 0.5)' : 'rgba(255, 255, 255, 0.06)'};
  width: 60px;
  height: 60px;
  color: ${p => p.$active ? '#e2e8f0' : 'white'};
  font-size: 0.8rem;
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

const GraphBar = styled.div`
  width: 100%;
  max-width: 300px;
  height: 12px;
  background: rgba(255, 255, 255, 0.05);
  overflow: hidden;
  margin: 16px auto;
`;

const GraphFill = styled(motion.div)<{ $pct: number }>`
  height: 100%;
  width: ${p => p.$pct}%;
  background: linear-gradient(90deg, #818cf8, #f59e0b);
`;

interface Props { onReward: (c: number, x: number) => void }

export default function CrashGame({ onReward }: Props) {
  const [bet, setBet] = useState(10);
  const [mult, setMult] = useState(1);
  const [phase, setPhase] = useState<'bet' | 'playing' | 'crashed' | 'won'>('bet');
  const [result, setResult] = useState<{ coins: number; message: string } | null>(null);
  const multRef = useRef(1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = () => {
    setMult(1);
    multRef.current = 1;
    setResult(null);
    setPhase('playing');
    const crashAt = 1.5 + Math.random() * 4;
    let elapsed = 0;

    timerRef.current = setInterval(() => {
      elapsed += 50;
      const growth = 1 + Math.pow(elapsed / 1000, 1.3) * 0.5;
      multRef.current = growth;
      setMult(growth);
      if (Math.floor(growth * 10) !== Math.floor((growth - 0.05) * 10)) playTick();

      if (growth >= crashAt) {
        clearInterval(timerRef.current!);
        timerRef.current = null;
        setPhase('crashed');
        playLose();
        setResult({ coins: 0, message: `Crashed at ${growth.toFixed(2)}x` });
      }
    }, 50);
  };

  const cashout = () => {
    if (phase !== 'playing') return;
    clearInterval(timerRef.current!);
    timerRef.current = null;
    const finalMult = multRef.current;
    const coins = Math.floor(bet * finalMult);
    setPhase('won');
    playCashout();
    setResult({ coins, message: `Cashed out at ${finalMult.toFixed(2)}x` });
    onReward(coins, Math.floor(coins * 0.1 + 5));
  };

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const barPct = Math.min((mult - 1) / 5 * 100, 100);

  return (
    <Container>
      {phase === 'bet' && (
        <>
          <div style={{ color: '#94a3b8', marginBottom: 12 }}>Place your bet</div>
          <BetRow>
            {[10, 25, 50, 100].map(amount => (
              <Chip key={amount} $active={bet === amount} onClick={() => setBet(amount)} whileTap={{ scale: 0.9 }}>
                {amount}
              </Chip>
            ))}
          </BetRow>
          <Button onClick={start} whileTap={{ scale: 0.95 }}>Start</Button>
        </>
      )}

      {phase === 'playing' && (
        <>
          <GraphBar>
            <GraphFill $pct={barPct} />
          </GraphBar>
          <Multiplier
            key={Math.floor(mult * 100)}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
          >
            {mult.toFixed(2)}x
          </Multiplier>
          <CashoutBtn onClick={cashout} whileTap={{ scale: 0.95 }}>
            Cash Out ({Math.floor(bet * mult)} coins)
          </CashoutBtn>
        </>
      )}

      {(phase === 'crashed' || phase === 'won') && (
        <>
          {phase === 'crashed' ? (
            <MultiplierCrashed>💥 {mult.toFixed(2)}x</MultiplierCrashed>
          ) : (
            <Multiplier style={{ color: '#818cf8' }}>{mult.toFixed(2)}x ✅</Multiplier>
          )}
          {result && (
            <ResultBox
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {result.coins > 0 ? (
                <>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ fontSize: '3rem' }}>
                    🚀
                  </motion.div>
                  <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                    style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#818cf8' }}>
                    {result.message}
                  </motion.div>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4, type: 'spring' }}
                    style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>
                    +{result.coins} coins
                  </motion.div>
                </>
              ) : (
                <div>
                  <div style={{ fontSize: '2rem' }}>💥</div>
                  <div style={{ fontWeight: 'bold', marginTop: 4 }}>{result.message}</div>
                </div>
              )}
              <Button onClick={() => setPhase('bet')} whileTap={{ scale: 0.95 }} style={{ marginTop: 12 }}>
                Try Again
              </Button>
            </ResultBox>
          )}
        </>
      )}
    </Container>
  );
}
