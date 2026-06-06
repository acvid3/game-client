'use client';

import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Gem } from 'lucide-react';
import { useGameContext } from '@/context/GameContext';
import DiceRollGame from '@/components/games/DiceRollGame';
import SpinWheelGame from '@/components/games/SpinWheelGame';
import CrashGame from '@/components/games/CrashGame';
import BlackjackGame from '@/components/games/BlackjackGame';
import LuckySpinGame from '@/components/games/LuckySpinGame';
import CollectionMatchGame from '@/components/games/CollectionMatchGame';

const Page = styled.div<{ $bg?: string }>`
  min-height: 100vh;
  background: #0d0d14;
  color: #e2e8f0;
  position: relative;
  &::before {
    content: '';
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    background-image: url(${props => props.$bg ? `/backgrounds/${props.$bg}.jpg` : '/backgrounds/games-bg.jpg'});
    background-size: cover;
    background-position: center;
    opacity: 0.1;
  }
  &::after {
    content: '';
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    background: radial-gradient(ellipse at 50% 50%, transparent 40%, #0d0d14 90%);
  }
  > * { position: relative; z-index: 1; }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 32px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
`;

const BackBtn = styled(motion.div)`
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 10px 20px;
  color: #94a3b8;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: border-color 0.2s, color 0.2s;
  &:hover {
    border-color: rgba(99, 102, 241, 0.4);
    color: #e2e8f0;
  }
`;

const Title = styled.h1`
  font-size: 1.6rem;
  margin: 0;
  font-weight: 700;
  color: #e2e8f0;
`;

const Subtitle = styled.p`
  color: #94a3b8;
  text-align: center;
  margin: 16px 0;
  font-size: 0.9rem;
`;

const GAME_MAP: Record<string, { component: React.FC<{ onReward: (c: number, x: number) => void }>; eventId: string }> = {
  'dice-roll': { component: DiceRollGame, eventId: 'dice_roll' },
  'spin-wheel': { component: SpinWheelGame, eventId: 'spin_wheel' },
  'crash': { component: CrashGame, eventId: 'memory_match' },
  'memory-match': { component: CrashGame, eventId: 'memory_match' },
  'blackjack': { component: BlackjackGame, eventId: 'click_rush' },
  'click-rush': { component: BlackjackGame, eventId: 'click_rush' },
  'lucky-spin': { component: LuckySpinGame, eventId: 'lucky_draw' },
  'lucky-draw': { component: LuckySpinGame, eventId: 'lucky_draw' },
  'collection': { component: CollectionMatchGame, eventId: 'collection' },
};

const GAME_NAMES: Record<string, string> = {
  'dice-roll': 'Dice Roll',
  'spin-wheel': 'Spin Wheel',
  'crash': 'Crash',
  'memory-match': 'Crash',
  'blackjack': 'Blackjack',
  'lucky-spin': 'Lucky Spin',
  'collection': 'Collection',
};

const CRYSTAL_REGEN = 300000;

const BG_MAP: Record<string, string> = {
  'dice-roll': 'dice',
  'spin-wheel': 'wheel',
  'crash': 'crash',
  'memory-match': 'crash',
  'blackjack': 'blackjack',
  'click-rush': 'blackjack',
  'lucky-spin': 'slots',
  'lucky-draw': 'slots',
  'collection': 'collection',
};

const BottomBar = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(13, 13, 20, 0.95);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  padding: 16px 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  z-index: 20;
`;

const BottomBarText = styled.div`
  color: #94a3b8;
  font-size: 0.9rem;
`;

const BottomBarBtn = styled(motion.button)<{ $free?: boolean }>`
  background: ${props => props.$free ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255, 255, 255, 0.04)'};
  border: 1px solid ${props => props.$free ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.08)'};
  padding: 10px 24px;
  color: ${props => props.$free ? '#818cf8' : '#e2e8f0'};
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s, border-color 0.2s;
  &:hover:not(:disabled) {
    background: rgba(99, 102, 241, 0.15);
    border-color: rgba(99, 102, 241, 0.5);
  }
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

export default function GamePage({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const game = GAME_MAP[slug];
  const { state, updateEvent, addCoins, addXp, resetEvent, spendCrystal, addCrystals, setNextCrystal } = useGameContext();
  const event = state.events.find(e => e.id === game?.eventId);
  const [now, setNow] = useState(Date.now());
  const [buying, setBuying] = useState(false);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (state.user.nextCrystalAt && now >= state.user.nextCrystalAt) {
      if (state.user.crystals < 10) {
        addCrystals(1);
        setNextCrystal(now + CRYSTAL_REGEN);
      } else {
        setNextCrystal(null);
      }
    }
  }, [now, state.user.nextCrystalAt, addCrystals, setNextCrystal, state.user.crystals]);

  useEffect(() => {
    if (state.user.nextCrystalAt && state.user.nextCrystalAt - now > CRYSTAL_REGEN) {
      setNextCrystal(null);
    }
  }, []);

  if (!game || !event) {
    return (
      <Page $bg={BG_MAP[slug]}>
        <Header>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <BackBtn><ArrowLeft size={16} /> Back</BackBtn>
          </Link>
          <Title>{game ? GAME_NAMES[slug] : 'Game not found'}</Title>
        </Header>
      </Page>
    );
  }

  if (event.resetsAt && now >= event.resetsAt) {
    resetEvent(event.id);
  }

  const attemptsLeft = event.resetsAt ? 0 : event.maxAttempts - event.attempts;
  const nextCrystalAt = state.user.nextCrystalAt;
  const crystalSec = nextCrystalAt ? Math.max(0, Math.floor((nextCrystalAt - now) / 1000)) : 0;

  const vipMult = 1 + (state.user.level - 1) * 0.25;

  const handleReward = (coins: number, xp: number) => {
    const ev = state.events.find(e => e.id === game.eventId);
    if (!ev || ev.attempts >= ev.maxAttempts) return;
    const multCoins = Math.floor(coins * vipMult);
    const multXp = Math.floor(xp * vipMult);
    addCoins(multCoins);
    addXp(multXp);
    const nextAttempts = ev.attempts + 1;
    updateEvent({ ...ev, attempts: nextAttempts, cooldownEnd: Date.now() + 30000, resetsAt: null });
    if (nextAttempts >= ev.maxAttempts) {
      setShowResult(true);
    }
  };

  const handleRestore = () => {
    if (state.user.crystals > 0) {
      spendCrystal(game.eventId);
      setShowResult(false);
    } else if (!nextCrystalAt && state.user.crystals < 10) {
      addCrystals(1);
      setNextCrystal(now + CRYSTAL_REGEN);
      setBuying(true);
      setTimeout(() => setBuying(false), 1000);
    }
  };

  const GameComponent = game.component;

  return (
    <Page $bg={BG_MAP[slug]}>
      <Header>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <BackBtn whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <ArrowLeft size={16} /> Back
          </BackBtn>
        </Link>
        <Title>{GAME_NAMES[slug]}</Title>
      </Header>
      <Subtitle>
        <span>
          {attemptsLeft > 0
            ? `Attempts left: ${attemptsLeft}`
            : 'No attempts remaining'}
        </span>
        {crystalSec > 0 && state.user.crystals < 10 && (
          <span style={{ marginLeft: 16, fontSize: '0.85rem', color: '#818cf8' }}>
            Free <Gem size={12} style={{ verticalAlign: 'middle' }} /> in {Math.floor(crystalSec / 60)}:{String(crystalSec % 60).padStart(2, '0')}
          </span>
        )}
      </Subtitle>
      <div style={{ paddingBottom: 80 }}>
        <div style={{ opacity: showResult || attemptsLeft <= 0 ? 0.5 : 1, pointerEvents: showResult || attemptsLeft <= 0 ? 'none' : 'auto' }}>
          <GameComponent onReward={handleReward} />
        </div>
      </div>
      <BottomBar>
        {attemptsLeft > 0 ? (
          <BottomBarText>Attempts left: {attemptsLeft}</BottomBarText>
        ) : state.user.crystals > 0 ? (
          <>
            <BottomBarText>No attempts remaining</BottomBarText>
            <BottomBarBtn
              onClick={() => { spendCrystal(game.eventId); setShowResult(false); }}
              disabled={buying}
              whileTap={{ scale: 0.95 }}
            >
              Restore (1 <Gem size={14} style={{ verticalAlign: 'middle' }} />)
            </BottomBarBtn>
          </>
        ) : crystalSec > 0 ? (
          <>
            <BottomBarText>Free in {Math.floor(crystalSec / 60)}:{String(crystalSec % 60).padStart(2, '0')}</BottomBarText>
          </>
        ) : state.user.crystals < 10 ? (
          <>
            <BottomBarText>No attempts remaining</BottomBarText>
            <BottomBarBtn $free onClick={handleRestore} whileTap={{ scale: 0.95 }}>
              Claim free <Gem size={14} style={{ verticalAlign: 'middle' }} />
            </BottomBarBtn>
          </>
        ) : null}
      </BottomBar>
    </Page>
  );
}
