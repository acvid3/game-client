import React, { createContext, useContext, ReactNode } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { GameState } from '@/types';

interface GameContextType {
  state: GameState;
  addCoins: (amount: number) => void;
  addXp: (amount: number) => void;
  setPremium: (premium: boolean) => void;
  updateEvent: (event: any) => void;
  claimFreeReward: (level: number) => void;
  claimPremiumReward: (level: number) => void;
  reset: () => void;
  resetEvent: (eventId: string) => void;
  addCrystals: (amount: number) => void;
  spendCrystal: (eventId: string) => void;
  setNextCrystal: (time: number | null) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const gameState = useGameState();

  return (
    <GameContext.Provider value={gameState}>
      {children}
    </GameContext.Provider>
  );
}

export function useGameContext() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
}
