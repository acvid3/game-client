'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components'
import { playRoll, playWin, playLose, playJackpot, playDeal, playCashout, playMatch, playSpin, playTick } from '@/utils/sounds';

const Container = styled.div`
  text-align: center;
  padding: 32px;
`;

const ChipRow = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
  margin: 16px 0;
  flex-wrap: wrap;
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
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Button = styled(motion.button)`
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.3);
  padding: 12px 28px;
  color: #e0e0e0;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  &:hover { background: rgba(99, 102, 241, 0.18); border-color: rgba(99, 102, 241, 0.5); }
  margin: 4px;
`;

const CardsRow = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
  margin: 12px 0;
  min-height: 80px;
`;

const CardBox = styled(motion.div)`
  width: 56px;
  height: 80px;
  background: ${p => p.children === '🂠' ? 'rgba(99, 102, 241, 0.1)' : 'white'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  color: #e2e8f0;
`;

const ResultBox = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  padding: 16px;
  margin: 12px auto;
  max-width: 280px;
`;

const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

interface Card {
  suit: string;
  rank: string;
}

function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank });
    }
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function cardValue(rank: string): number {
  if (rank === 'A') return 11;
  if (['J', 'Q', 'K'].includes(rank)) return 10;
  return parseInt(rank);
}

function handValue(hand: Card[]): number {
  let total = hand.reduce((s, c) => s + cardValue(c.rank), 0);
  let aces = hand.filter(c => c.rank === 'A').length;
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

interface Props { onReward: (c: number, x: number) => void }

export default function BlackjackGame({ onReward }: Props) {
  const [bet, setBet] = useState(10);
  const [deck, setDeck] = useState<Card[]>(() => createDeck());
  const [player, setPlayer] = useState<Card[]>([]);
  const [dealer, setDealer] = useState<Card[]>([]);
  const [phase, setPhase] = useState<'bet' | 'play' | 'result'>('bet');
  const [result, setResult] = useState<{ message: string; coins: number } | null>(null);

  const startGame = () => {
    const d = createDeck();
    const p: Card[] = [d.pop()!, d.pop()!];
    const dl: Card[] = [d.pop()!, d.pop()!];
    setDeck(d);
    setPlayer(p);
    setDealer(dl);
    setPhase('play');
    setResult(null);
    playDeal();

    const pv = handValue(p);
    if (pv === 21) {
      endGame(d, p, dl, false);
    }
  };

  const hit = () => {
    if (phase !== 'play') return;
    const d = [...deck];
    const p = [...player, d.pop()!];
    setDeck(d);
    setPlayer(p);
    playDeal();
    if (handValue(p) > 21) {
      endGame(d, p, dealer, false);
    }
  };

  const stand = () => {
    if (phase !== 'play') return;
    endGame(deck, player, dealer, true);
  };

  const endGame = (d: Card[], p: Card[], dl: Card[], dealerPlays: boolean) => {
    let finalDealer = dl;
    if (dealerPlays) {
      const fd = [...dl];
      while (handValue(fd) < 17) {
        fd.push(d.pop()!);
      }
      finalDealer = fd;
      setDeck(d);
    }

    const pv = handValue(p);
    const dv = handValue(finalDealer);
    let message: string;
    let coins: number;

    if (pv > 21) {
      message = `Bust! (${pv})`;
      coins = 0;
    } else if (dv > 21 || pv > dv) {
      message = `You win! ${pv} vs ${dv}`;
      coins = bet * 2;
    } else if (pv === dv) {
      message = `Push! ${pv} vs ${dv}`;
      coins = bet;
    } else {
      message = `Dealer wins! ${pv} vs ${dv}`;
      coins = 0;
    }

    if (pv === 21 && p.length === 2 && dl.length === 2 && dealerPlays) {
      message = 'BLACKJACK!';
      coins = Math.floor(bet * 2.5);
    }

    setDealer(finalDealer);
    setPhase('result');
    setResult({ message, coins });
    if (coins > bet) playJackpot(); else if (coins > 0) playWin(); else playLose();
    if (coins > 0) onReward(coins, Math.floor(coins * 0.1 + 5));
  };

  const formatCard = (card: Card) => {
    const red = card.suit === '♥' || card.suit === '♦';
    return { char: `${card.rank}${card.suit}`, color: red ? '#ef4444' : '#0d0d14' };
  };

  return (
    <Container>
      {phase === 'bet' && (
        <>
          <div style={{ marginBottom: 12, color: '#94a3b8' }}>Place your bet</div>
          <ChipRow>
            {[10, 25, 50, 100].map(amount => (
              <Chip key={amount} $active={bet === amount} onClick={() => setBet(amount)}>
                {amount}
              </Chip>
            ))}
          </ChipRow>
          <Button onClick={startGame} whileTap={{ scale: 0.95 }}>Deal</Button>
        </>
      )}

      {(phase === 'play' || phase === 'result') && (
        <>
          <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Dealer: {handValue(dealer)}</div>
          <CardsRow>
            {dealer.map((c, i) => {
              const f = formatCard(c);
              return (
                <CardBox key={i} initial={{ rotateY: 180 }} animate={{ rotateY: 0 }}
                  style={{ color: f.color, fontWeight: 'bold' }}>
                  {f.char}
                </CardBox>
              );
            })}
          </CardsRow>

          <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: 16 }}>Player: {handValue(player)}</div>
          <CardsRow>
            {player.map((c, i) => {
              const f = formatCard(c);
              return (
                <CardBox key={i} initial={{ rotateY: 180 }} animate={{ rotateY: 0 }}
                  style={{ color: f.color, fontWeight: 'bold' }}>
                  {f.char}
                </CardBox>
              );
            })}
          </CardsRow>

          {phase === 'play' && (
            <div style={{ marginTop: 16 }}>
              <Button onClick={hit} whileTap={{ scale: 0.95 }}>Hit</Button>
              <Button onClick={stand} whileTap={{ scale: 0.95 }}>Stand</Button>
            </div>
          )}

          {result && (
            <ResultBox
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {result.coins > 0 ? (
                <>
                  <motion.div
                    initial={{ rotate: -180, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                    style={{ fontSize: '3rem' }}
                  >
                    🎉
                  </motion.div>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f59e0b' }}
                  >
                    {result.message}
                  </motion.div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                    style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#818cf8', marginTop: 4 }}
                  >
                    +{result.coins} coins
                  </motion.div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '2.5rem' }}>😢</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginTop: 4 }}>{result.message}</div>
                </>
              )}
              <Button onClick={() => { setPhase('bet'); setPlayer([]); setDealer([]); setResult(null); }}
                whileTap={{ scale: 0.95 }} style={{ marginTop: 12 }}>
                Play Again
              </Button>
            </ResultBox>
          )}
        </>
      )}
    </Container>
  );
}
