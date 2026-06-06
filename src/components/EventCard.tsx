import React, { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import styled, { keyframes } from 'styled-components';
import { EventState } from '@/types';

const bounce = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-6px) rotate(10deg); }
  75% { transform: translateY(-6px) rotate(-10deg); }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const reelSpin = keyframes`
  0% { transform: translateY(-60px); }
  100% { transform: translateY(60px); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.8; }
`;

const cardFlip = keyframes`
  0% { transform: rotateY(0deg); }
  50% { transform: rotateY(90deg); }
  100% { transform: rotateY(0deg); }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 5px rgba(99, 102, 241, 0.2); }
  50% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.4); }
`;

const Card = styled(motion.div)`
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 20px;
  color: #e2e8f0;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: border-color 0.3s;
  @media (max-width: 768px) { min-height: 160px; padding: 14px; }
  &:hover {
    border-color: rgba(99, 102, 241, 0.4);
  }
`;

const CardBg = styled.div<{ $x: number; $y: number }>`
  position: absolute;
  inset: -10%;
  width: 120%;
  height: 120%;
  background: radial-gradient(circle at ${props => 50 + props.$x}% ${props => 50 + props.$y}%, rgba(99, 102, 241, 0.06), transparent 60%);
  pointer-events: none;
  transition: transform 0.1s ease-out;
  transform: translate(${props => props.$x * 0.5}px, ${props => props.$y * 0.5}px);
  z-index: 0;
`;

const CardContent = styled.div`
  position: relative;
  z-index: 1;
`;

const CardTitle = styled.h3`
  font-size: 1.2rem;
  margin: 0;
  font-weight: 500;
  color: #e2e8f0;
`;

const CardStatus = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
`;

const Badge = styled.span<{ $completed?: boolean }>`
  background: ${props => props.$completed ? 'rgba(34, 197, 94, 0.1)' : 'rgba(99, 102, 241, 0.1)'};
  border: 1px solid ${props => props.$completed ? 'rgba(34, 197, 94, 0.3)' : 'rgba(99, 102, 241, 0.3)'};
  padding: 4px 12px;
  font-size: 0.8rem;
  color: ${props => props.$completed ? '#22c55e' : '#818cf8'};
`;

const CooldownTimer = styled.div`
  font-size: 0.8rem;
  color: #94a3b8;
`;

const PreviewArea = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 80px;
  margin: 8px 0;
`;

const DiceDot = styled.div<{ $d: number }>`
  width: 6px;
  height: 6px;
  background: #818cf8;
  position: absolute;
  top: ${p => (p.$d <= 3 ? 20 : 60)}%;
  left: ${p => (p.$d % 2 === 0 ? 25 : 75)}%;
  transform: translate(-50%, -50%);
  &:nth-child(5) { top: 40%; left: 50%; }
`;

const DicePreview = styled.div`
  width: 36px;
  height: 36px;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.3);
  position: relative;
  animation: ${bounce} 1.5s ease-in-out infinite;
  &:nth-child(2) { animation-delay: 0.3s; }
  ${[1, 6].map(n => {
    const dots = n === 1 ? [5] : [1, 3, 4, 6, 5];
    return dots.map(d => `& > :nth-child(${dots.indexOf(d) + 1}) { opacity: 1; }`).join('');
  })}
`;

const DiceInner = styled.div`
  position: absolute;
  inset: 4px;
`;

const WheelPreview = styled.div`
  width: 54px;
  height: 54px;
  border: 2px solid rgba(99, 102, 241, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${spin} 3s linear infinite;
  &::before {
    content: '';
    width: 8px;
    height: 8px;
    background: #818cf8;
  }
  &::after {
    content: '';
    position: absolute;
    width: 40px;
    height: 2px;
    background: rgba(99, 102, 241, 0.2);
  }
`;

const ReelPreview = styled.div`
  display: flex;
  gap: 4px;
`;

const ReelItem = styled.div<{ $delay: number }>`
  width: 24px;
  height: 36px;
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  &::after {
    content: '';
    width: 10px;
    height: 10px;
    background: #818cf8;
    position: absolute;
    animation: ${reelSpin} 0.8s ease-in-out ${p => p.$delay}s infinite;
  }
`;

const GraphPreview = styled.div`
  width: 100%;
  height: 40px;
  display: flex;
  align-items: flex-end;
  gap: 3px;
`;

const GraphBar = styled.div<{ $h: number; $delay: number }>`
  width: 8px;
  height: ${p => p.$h}%;
  background: rgba(99, 102, 241, 0.4);
  animation: ${pulse} 1.5s ease-in-out ${p => p.$delay}s infinite;
`;

const CardPreview = styled.div`
  width: 24px;
  height: 36px;
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.2);
  position: relative;
  animation: ${cardFlip} 2s ease-in-out infinite;
  &:nth-child(2) { animation-delay: 0.3s; }
  &::after {
    content: '';
    position: absolute;
    inset: 4px;
    border: 1px solid rgba(99, 102, 241, 0.15);
  }
`;

const ItemsRow = styled.div`
  display: flex;
  gap: 6px;
`;

const ItemGlow = styled.div<{ $delay: number; $color?: string }>`
  width: 30px;
  height: 30px;
  background: ${p => p.$color || 'rgba(99, 102, 241, 0.1)'};
  border: 1px solid ${p => p.$color || 'rgba(99, 102, 241, 0.2)'};
  animation: ${glow} 1.5s ease-in-out ${p => p.$delay}s infinite;
`;

function GamePreview({ id }: { id: string }) {
  switch (id) {
    case 'dice_roll':
      return (
        <PreviewArea>
          <DicePreview>
            <DiceInner><DiceDot $d={1} /><DiceDot $d={6} /></DiceInner>
          </DicePreview>
          <DicePreview>
            <DiceInner><DiceDot $d={1} /><DiceDot $d={2} /><DiceDot $d={3} /><DiceDot $d={4} /><DiceDot $d={5} /><DiceDot $d={6} /></DiceInner>
          </DicePreview>
        </PreviewArea>
      );
    case 'spin_wheel':
      return (
        <PreviewArea>
          <WheelPreview />
        </PreviewArea>
      );
    case 'memory_match':
      return (
        <PreviewArea>
          <GraphPreview>
            {[10, 25, 45, 70, 100, 60, 85, 40, 55, 30].map((h, i) => (
              <GraphBar key={i} $h={h} $delay={i * 0.1} />
            ))}
          </GraphPreview>
        </PreviewArea>
      );
    case 'click_rush':
      return (
        <PreviewArea>
          <CardPreview />
          <CardPreview />
        </PreviewArea>
      );
    case 'lucky_draw':
      return (
        <PreviewArea>
          <ReelPreview>
            <ReelItem $delay={0} />
            <ReelItem $delay={0.2} />
            <ReelItem $delay={0.4} />
            <ReelItem $delay={0.6} />
            <ReelItem $delay={0.8} />
          </ReelPreview>
        </PreviewArea>
      );
    case 'collection':
      return (
        <PreviewArea>
          <ItemsRow>
            <ItemGlow $delay={0} />
            <ItemGlow $delay={0.3} $color="rgba(129, 140, 248, 0.15)" />
            <ItemGlow $delay={0.6} />
            <ItemGlow $delay={0.9} $color="rgba(245, 158, 11, 0.15)" />
          </ItemsRow>
        </PreviewArea>
      );
    default:
      return null;
  }
}

interface EventCardProps {
  event: EventState;
  onPlay: (eventId: string) => void;
}

export function EventCard({ event, onPlay }: EventCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const cooldownRemaining = event.cooldownEnd ? Math.max(0, event.cooldownEnd - Date.now()) : 0;
  const isOnCooldown = cooldownRemaining > 0;
  const attemptsRemaining = Math.max(0, event.maxAttempts - event.attempts);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setOffset({ x: x / rect.width * 20, y: y / rect.height * 20 });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setOffset({ x: 0, y: 0 });
  }, []);

  return (
    <Card
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => !isOnCooldown && !event.completed && onPlay(event.id)}
      style={{ opacity: event.completed ? 0.4 : 1 }}
    >
      <CardBg $x={offset.x} $y={offset.y} />
      <CardContent>
        <CardTitle>{event.name}</CardTitle>
        <GamePreview id={event.id} />
        <CardStatus>
          <Badge $completed={event.completed}>
            {event.completed ? 'Completed' : `${attemptsRemaining} attempts left`}
          </Badge>
          {isOnCooldown && (
            <CooldownTimer>
              {Math.ceil(cooldownRemaining / 1000)}s
            </CooldownTimer>
          )}
        </CardStatus>
      </CardContent>
    </Card>
  );
}
