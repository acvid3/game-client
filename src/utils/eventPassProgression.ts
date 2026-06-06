export interface PassLevel {
  level: number;
  xpRequired: number;
  freeReward: { coins: number; item?: string };
  premiumReward: { coins: number; item?: string };
}

export const PASS_LEVELS: PassLevel[] = Array.from({ length: 30 }, (_, i) => ({
  level: i + 1,
  xpRequired: 100 + i * 50,
  freeReward: {
    coins: 50 + i * 10,
    item: i % 5 === 0 ? `Free Skin ${i / 5 + 1}` : undefined,
  },
  premiumReward: {
    coins: 100 + i * 20,
    item: i % 3 === 0 ? `Premium Item ${i / 3 + 1}` : undefined,
  },
}));

export function calculateLevel(xp: number): number {
  let accumulatedXp = 0;
  for (let i = 0; i < PASS_LEVELS.length; i++) {
    accumulatedXp += PASS_LEVELS[i].xpRequired;
    if (xp < accumulatedXp) {
      return i + 1;
    }
  }
  return PASS_LEVELS.length;
}

export function getXpForNextLevel(currentLevel: number): number {
  if (currentLevel >= PASS_LEVELS.length) return 0;
  return PASS_LEVELS[currentLevel].xpRequired;
}

export function getCurrentLevelProgress(xp: number): { level: number; progress: number; xpInLevel: number; xpForNext: number } {
  const level = calculateLevel(xp);
  const xpForNext = getXpForNextLevel(level);
  let xpInLevel = xp;
  for (let i = 0; i < level - 1; i++) {
    xpInLevel -= PASS_LEVELS[i].xpRequired;
  }
  const progress = xpForNext > 0 ? xpInLevel / xpForNext : 1;
  return { level, progress, xpInLevel, xpForNext };
}
