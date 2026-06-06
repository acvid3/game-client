export interface UserState {
  coins: number;
  xp: number;
  level: number;
  premium: boolean;
  premiumExpiry: number | null;
  crystals: number;
  nextCrystalAt: number | null;
}

export interface EventState {
  id: string;
  name: string;
  type: EventType;
  completed: boolean;
  attempts: number;
  maxAttempts: number;
  cooldownEnd: number | null;
  resetsAt: number | null;
  rewards: Reward[];
}

export type EventType = 'trivia' | 'dice' | 'collection' | 'memory' | 'spin' | 'click';

export interface Reward {
  type: 'coins' | 'xp' | 'premium';
  amount: number;
}

export interface EventPassLevel {
  level: number;
  xpRequired: number;
  freeReward: Reward;
  premiumReward: Reward;
}

export interface GameState {
  user: UserState;
  events: EventState[];
  eventPass: EventPassState;
}

export interface EventPassState {
  currentLevel: number;
  currentXp: number;
  premium: boolean;
  claimedFree: number[];
  claimedPremium: number[];
}
