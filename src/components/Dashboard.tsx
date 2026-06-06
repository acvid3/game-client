import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Trophy, ShoppingCart, Gem, User } from 'lucide-react';
import { useGameContext } from '@/context/GameContext';
import { EventCard } from './EventCard';
import { getCurrentLevelProgress } from '../utils/eventPassProgression';

const SLUG_MAP: Record<string, string> = {
  dice_roll: 'dice-roll',
  spin_wheel: 'spin-wheel',
  memory_match: 'crash',
  click_rush: 'blackjack',
  lucky_draw: 'lucky-spin',
  collection: 'collection',
};

const DashboardContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  position: relative;
  &::before {
    content: '';
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    background-image: url('/backgrounds/dashboard-bg.jpg');
    background-size: cover;
    background-position: center;
    opacity: 0.06;
  }
  &::after {
    content: '';
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    background: radial-gradient(ellipse at 50% 50%, transparent 30%, #0d0d14 85%);
  }
  > * { position: relative; z-index: 1; }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const UserStats = styled.div`
  display: flex;
  gap: 12px;
  align-items: stretch;
`;

const StatItem = styled.div`
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 8px 16px;
  text-align: center;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 56px;
`;

const StatValue = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  color: #e2e8f0;
  line-height: 1;
`;

const StatLabel = styled.div`
  font-size: 0.7rem;
  color: #94a3b8;
  margin-top: 4px;
  line-height: 1;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const PremiumBadge = styled(motion.div)`
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  padding: 8px 14px;
  font-weight: 600;
  color: #f59e0b;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  min-height: 56px;
`;

const PassIcon = styled(motion.button)`
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 8px 14px;
  color: #94a3b8;
  font-size: 1.2rem;
  cursor: pointer;
  position: relative;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: border-color 0.2s, color 0.2s;
  min-height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    border-color: rgba(99, 102, 241, 0.4);
    color: #e2e8f0;
  }
`;

const RedDot = styled.div`
  position: absolute;
  top: -2px;
  right: -2px;
  width: 10px;
  height: 10px;
  background: #ef4444;
`;

const EventsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 30px;
`;

const XPProgressBar = styled.div`
  background: rgba(255, 255, 255, 0.04);
  height: 4px;
  overflow: hidden;
  margin: 10px 0;
`;

const XPProgressFill = styled(motion.div)<{ $progress: number }>`
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  height: 100%;
  width: ${props => props.$progress}%;
`;

export function Dashboard() {
  const { state, reset } = useGameContext();
  const router = useRouter();
  const [now, setNow] = useState(Date.now());
  const [showProfile, setShowProfile] = useState(false);
  const progress = getCurrentLevelProgress(state.user.xp);
  const unclaimed = progress.level - state.eventPass.claimedFree.length;

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!showProfile) return;
    const handler = () => setShowProfile(false);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [showProfile]);

  const nextCrystalAt = state.user.nextCrystalAt;
  const crystalSec = nextCrystalAt ? Math.max(0, Math.floor((nextCrystalAt - now) / 1000)) : 0;

  const handlePlayEvent = (eventId: string) => {
    router.push(`/games/${SLUG_MAP[eventId] || eventId}`);
  };

  const xpInLevel = state.user.xp % 1000;
  const xpProgress = xpInLevel / 10;

  const handleReset = () => {
    localStorage.removeItem('gameState');
    reset();
    window.location.reload();
  };

  return (
    <DashboardContainer>

      <Header>
        <div style={{ display: 'flex', gap: 12, alignItems: 'stretch' }}>
          <div style={{ position: 'relative' }}>
            <PassIcon onClick={(e: React.MouseEvent) => { e.stopPropagation(); setShowProfile(p => !p); }}>
              <User size={20} />
            </PassIcon>
            {showProfile && (
              <div onClick={e => e.stopPropagation()} style={{
                position: 'absolute', left: 0, top: '100%', marginTop: 8, zIndex: 50,
                background: 'rgba(13, 13, 20, 0.96)', border: '1px solid rgba(255, 255, 255, 0.06)',
                padding: 16, minWidth: 200, backdropFilter: 'blur(16px)',
              }}>
                <button onClick={handleReset} style={{
                  width: '100%', padding: '10px 16px', cursor: 'pointer', border: '1px solid rgba(239, 68, 68, 0.3)',
                  background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '0.9rem', fontWeight: 500,
                }}>
                  Reset all to start
                </button>
              </div>
            )}
          </div>
          <StatItem>
            <StatValue>{state.user.level}</StatValue>
            <StatLabel>Level</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{state.user.coins}</StatValue>
            <StatLabel>Power</StatLabel>
          </StatItem>
        </div>
        <UserStats>
          <PassIcon
            onClick={() => router.push('/event-pass')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Trophy size={20} />
            {unclaimed > 0 && <RedDot />}
          </PassIcon>
          <PassIcon
            onClick={() => router.push('/monetization')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ShoppingCart size={20} />
          </PassIcon>
          <StatItem>
            <StatValue>{state.user.crystals}</StatValue>
            <StatLabel><Gem size={14} style={{ verticalAlign: 'middle' }} /></StatLabel>
            {crystalSec > 0 && state.user.crystals < 10 && (
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: 2 }}>
                Free in {Math.floor(crystalSec / 60)}:{String(crystalSec % 60).padStart(2, '0')}
              </div>
            )}
          </StatItem>
          {state.user.premium && (
            <PremiumBadge
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500 }}
            >
              Premium
            </PremiumBadge>
          )}
        </UserStats>
      </Header>

      <XPProgressBar>
        <XPProgressFill
          $progress={xpProgress}
          initial={{ width: 0 }}
          animate={{ width: `${xpProgress}%` }}
          transition={{ duration: 0.5 }}
        />
      </XPProgressBar>

      <EventsGrid>
        {state.events.map(event => (
          <EventCard
            key={event.id}
            event={event}
            onPlay={handlePlayEvent}
          />
        ))}
      </EventsGrid>
    </DashboardContainer>
  );
}
