import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import { playCashout } from '@/utils/sounds';
import { useGameContext } from '../context/GameContext';
import { PASS_LEVELS, getCurrentLevelProgress } from '../utils/eventPassProgression';
import styles from '../styles/EventPass.module.css';

export function EventPass() {
  const { state, setPremium, addCoins, addXp, claimFreeReward, claimPremiumReward } = useGameContext();
  const [premiumCode, setPremiumCode] = useState('');
  const [showReward, setShowReward] = useState<string | null>(null);

  const xp = state.user.xp;
  const progress = getCurrentLevelProgress(xp);
  const claimedFree = state.eventPass.claimedFree;

  const handlePremiumActivation = () => {
    if (premiumCode.trim().toLowerCase() === 'acvid3') {
      setPremium(true);
      setPremiumCode('');
      playCashout();
    }
  };

  const claimReward = (levelIndex: number, track: 'free' | 'premium') => {
    const level = PASS_LEVELS[levelIndex];
    if (!level) return;
    if (levelIndex >= progress.level) return;
    if (track === 'free' && claimedFree.includes(levelIndex)) return;
    if (track === 'premium' && state.eventPass.claimedPremium.includes(levelIndex)) return;

    const reward = track === 'free' ? level.freeReward : level.premiumReward;
    addCoins(reward.coins);
    addXp(10);
    if (track === 'free') claimFreeReward(levelIndex);
    else claimPremiumReward(levelIndex);
    setShowReward(`Claimed ${reward.coins} coins from ${track} track!${reward.item ? ` + ${reward.item}` : ''}`);
    playCashout();
    setTimeout(() => setShowReward(null), 3000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Event Pass</h2>
        <div className={styles.levelInfo}>
          Level {progress.level} / {PASS_LEVELS.length}
        </div>
      </div>

      <div className={styles.progressBar}>
        <motion.div
          className={styles.progressFill}
          initial={{ width: 0 }}
          animate={{ width: `${progress.progress * 100}%` }}
          transition={{ duration: 0.5 }}
        />
        <span className={styles.progressText}>
          {progress.xpInLevel} / {progress.xpForNext} XP
        </span>
      </div>

      {!state.user.premium && (
        <div className={styles.premiumSection}>
          <input
            type="text"
            value={premiumCode}
            onChange={(e) => setPremiumCode(e.target.value)}
            placeholder="Enter premium code"
            className={styles.premiumInput}
          />
          <span className={styles.helpWrap}>
            <HelpCircle size={16} className={styles.helpIcon} />
            <span className={styles.tooltip}>
              Use code: acvid3
            </span>
          </span>
          <button onClick={handlePremiumActivation} className={styles.premiumButton}>
            Activate Premium
          </button>
        </div>
      )}

      {state.user.premium && (
        <div className={styles.premiumBadge}>
          Premium Active
        </div>
      )}

      <div className={styles.levelsList}>
        {PASS_LEVELS.map((level, index) => {
          const isUnlocked = index < progress.level;
          const isClaimed = state.user.premium
            ? state.eventPass.claimedPremium.includes(index)
            : claimedFree.includes(index);

          return (
            <motion.div
              key={level.level}
              className={`${styles.levelCard} ${isUnlocked ? styles.unlocked : styles.locked} ${isClaimed ? styles.claimed : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div className={styles.levelNumber}>Level {level.level}</div>
                <div className={styles.rewards}>
                <div className={styles.rewardItem}>
                  <span className={styles.rewardLabel}>Free:</span>
                  <span>{level.freeReward.coins} coins</span>
                  {level.freeReward.item && <span className={styles.rewardItemName}>{level.freeReward.item}</span>}
                </div>
                {state.user.premium && (
                  <div className={styles.rewardItem}>
                    <span className={styles.rewardLabel}>Premium:</span>
                    <span>{level.premiumReward.coins} coins</span>
                    {level.premiumReward.item && <span className={styles.rewardItemName}>{level.premiumReward.item}</span>}
                  </div>
                )}
              </div>
              </div>
              {isUnlocked && !isClaimed && (
                <button onClick={() => { claimReward(index, 'free'); if (state.user.premium) claimReward(index, 'premium'); }} className={styles.claimButton}>
                  Claim
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {showReward && (
          <motion.div
            className={styles.rewardNotification}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
          >
            {showReward}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
