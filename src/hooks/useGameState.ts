import { useReducer, useCallback, useEffect, useRef } from 'react';
import { GameState, UserState, EventState, Reward } from '@/types';
import { useLocalStorage } from './useLocalStorage';

const CRYSTAL_REGEN = 300000;

const initialEvents: EventState[] = [
  { id: 'dice_roll', name: 'Dice Roll', type: 'dice', completed: false, attempts: 0, maxAttempts: 5, cooldownEnd: null, resetsAt: null, rewards: [] },
  { id: 'spin_wheel', name: 'Spin Wheel', type: 'spin', completed: false, attempts: 0, maxAttempts: 3, cooldownEnd: null, resetsAt: null, rewards: [] },
  { id: 'memory_match', name: 'Crash', type: 'memory', completed: false, attempts: 0, maxAttempts: 5, cooldownEnd: null, resetsAt: null, rewards: [] },
  { id: 'collection', name: 'Collection', type: 'collection', completed: false, attempts: 0, maxAttempts: 3, cooldownEnd: null, resetsAt: null, rewards: [] },
  { id: 'click_rush', name: 'Blackjack', type: 'click', completed: false, attempts: 0, maxAttempts: 5, cooldownEnd: null, resetsAt: null, rewards: [] },
  { id: 'lucky_draw', name: 'Lucky Spin', type: 'trivia', completed: false, attempts: 0, maxAttempts: 2, cooldownEnd: null, resetsAt: null, rewards: [] },
];

const initialState: GameState = {
  user: {
    coins: 100,
    xp: 0,
    level: 1,
    premium: false,
    premiumExpiry: null,
    crystals: 10,
    nextCrystalAt: null,
  },
  events: initialEvents,
  eventPass: {
    currentLevel: 1,
    currentXp: 0,
    premium: false,
    claimedFree: [],
    claimedPremium: [],
  },
};

type GameAction =
  | { type: 'ADD_COINS'; payload: number }
  | { type: 'ADD_XP'; payload: number }
  | { type: 'SET_PREMIUM'; payload: boolean }
  | { type: 'UPDATE_EVENT'; payload: EventState }
  | { type: 'CLAIM_FREE_REWARD'; payload: number }
  | { type: 'CLAIM_PREMIUM_REWARD'; payload: number }
  | { type: 'RESET_EVENT'; payload: string }
  | { type: 'ADD_CRYSTALS'; payload: number }
  | { type: 'SPEND_CRYSTAL'; payload: string }
  | { type: 'SET_NEXT_CRYSTAL'; payload: number | null }
  | { type: 'RESET' };

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'ADD_COINS':
      return { ...state, user: { ...state.user, coins: state.user.coins + action.payload } };
    case 'ADD_XP': {
      const newXp = state.user.xp + action.payload;
      const newLevel = Math.floor(newXp / 1000) + 1;
      return { ...state, user: { ...state.user, xp: newXp, level: newLevel } };
    }
    case 'SET_PREMIUM':
      return { ...state, user: { ...state.user, premium: action.payload } };
    case 'UPDATE_EVENT':
      return {
        ...state,
        events: state.events.map(e => e.id === action.payload.id ? action.payload : e),
      };
    case 'CLAIM_FREE_REWARD':
      return {
        ...state,
        eventPass: {
          ...state.eventPass,
          claimedFree: [...state.eventPass.claimedFree, action.payload],
        },
      };
    case 'CLAIM_PREMIUM_REWARD':
      return {
        ...state,
        eventPass: {
          ...state.eventPass,
          claimedPremium: [...state.eventPass.claimedPremium, action.payload],
        },
      };
    case 'RESET_EVENT':
      return {
        ...state,
        events: state.events.map(e =>
          e.id === action.payload
            ? { ...e, attempts: 0, cooldownEnd: null, resetsAt: null }
            : e
        ),
      };
    case 'ADD_CRYSTALS':
      return { ...state, user: { ...state.user, crystals: state.user.crystals + action.payload } };
    case 'SPEND_CRYSTAL': {
      const newCrystals = state.user.crystals - 1;
      const newNextCrystalAt = state.user.nextCrystalAt ?? (newCrystals < 10 ? Date.now() + CRYSTAL_REGEN : null);
      return {
        ...state,
        user: { ...state.user, crystals: newCrystals, nextCrystalAt: newNextCrystalAt },
        events: state.events.map(e =>
          e.id === action.payload
            ? { ...e, attempts: 0, cooldownEnd: null, resetsAt: null }
            : e
        ),
      };
    }
    case 'SET_NEXT_CRYSTAL':
      return { ...state, user: { ...state.user, nextCrystalAt: action.payload } };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export function useGameState() {
  const [persistedState, setPersistedState] = useLocalStorage<GameState>('gameState', initialState);
  const initialEventNames: Record<string, string> = {};
  for (const ev of initialEvents) initialEventNames[ev.id] = ev.name;

  const sanitized: GameState = {
    ...persistedState,
    events: persistedState.events.map(e => ({
      ...e,
      name: initialEventNames[e.id] || e.name,
      attempts: Math.max(0, Math.min(e.attempts, e.maxAttempts)),
    })),
  };
  const [state, dispatch] = useReducer(gameReducer, sanitized);
  const isInit = useRef(true);

  useEffect(() => {
    if (isInit.current) {
      isInit.current = false;
      return;
    }
    setPersistedState(state);
  }, [state, setPersistedState]);

  const addCoins = useCallback((amount: number) => {
    dispatch({ type: 'ADD_COINS', payload: amount });
  }, []);

  const addXp = useCallback((amount: number) => {
    dispatch({ type: 'ADD_XP', payload: amount });
  }, []);

  const setPremium = useCallback((premium: boolean) => {
    dispatch({ type: 'SET_PREMIUM', payload: premium });
  }, []);

  const updateEvent = useCallback((event: EventState) => {
    dispatch({ type: 'UPDATE_EVENT', payload: event });
  }, []);

  const claimFreeReward = useCallback((level: number) => {
    dispatch({ type: 'CLAIM_FREE_REWARD', payload: level });
  }, []);

  const claimPremiumReward = useCallback((level: number) => {
    dispatch({ type: 'CLAIM_PREMIUM_REWARD', payload: level });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const resetEvent = useCallback((eventId: string) => {
    dispatch({ type: 'RESET_EVENT', payload: eventId });
  }, []);

  const addCrystals = useCallback((amount: number) => {
    dispatch({ type: 'ADD_CRYSTALS', payload: amount });
  }, []);

  const spendCrystal = useCallback((eventId: string) => {
    dispatch({ type: 'SPEND_CRYSTAL', payload: eventId });
  }, []);

  const setNextCrystal = useCallback((time: number | null) => {
    dispatch({ type: 'SET_NEXT_CRYSTAL', payload: time });
  }, []);

  return {
    state,
    addCoins,
    addXp,
    setPremium,
    updateEvent,
    claimFreeReward,
    claimPremiumReward,
    reset,
    resetEvent,
    addCrystals,
    spendCrystal,
    setNextCrystal,
  };
}
