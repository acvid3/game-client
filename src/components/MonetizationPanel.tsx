import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Gem, HelpCircle } from 'lucide-react';
import { playCashout } from '@/utils/sounds';
import { useGameContext } from '@/context/GameContext';

const Panel = styled(motion.div)`
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 20px;
  margin-top: 30px;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
`;

const PanelTitle = styled.h2`
  color: #e2e8f0;
  font-weight: 600;
  margin-bottom: 20px;
`;

const Input = styled.input`
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 10px;
  color: #e2e8f0;
  width: 200px;
  margin-right: 10px;
  outline: none;
  &:focus {
    border-color: rgba(99, 102, 241, 0.4);
  }
`;

const Button = styled(motion.button)`
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.3);
  padding: 10px 20px;
  color: #818cf8;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s, border-color 0.2s;
  &:hover {
    background: rgba(99, 102, 241, 0.15);
    border-color: rgba(99, 102, 241, 0.5);
  }
`;

const PremiumButton = styled(Button)`
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.3);
  color: #f59e0b;
  &:hover {
    background: rgba(245, 158, 11, 0.15);
    border-color: rgba(245, 158, 11, 0.5);
  }
`;

const SuccessMessage = styled(motion.div)`
  color: #22c55e;
  margin-top: 10px;
`;

export function MonetizationPanel() {
  const { state, setPremium, addCrystals } = useGameContext();
  const [now, setNow] = useState(Date.now());
  const [premiumCode, setPremiumCode] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const nextCrystalAt = state.user.nextCrystalAt;
  const crystalSec = nextCrystalAt ? Math.max(0, Math.floor((nextCrystalAt - now) / 1000)) : 0;

  const handleActivatePremium = () => {
    if (premiumCode.trim() === 'acvid3') {
      setPremium(true);
      setShowSuccess(true);
      playCashout();
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  return (
    <Panel
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <PanelTitle>Monetization</PanelTitle>
      
      {state.user.premium ? (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'inline-block', padding: '8px 16px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#f59e0b', fontWeight: 500, fontSize: '0.9rem' }}>
            Premium Active
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: 20 }}>
          <h3>Premium Pass</h3>
          <Input
            type="text"
            placeholder="Enter premium code"
            value={premiumCode}
            onChange={(e) => setPremiumCode(e.target.value)}
            style={{ width: 180 }}
          />
          <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', marginRight: 10 }}
            onMouseEnter={e => { const t = (e.currentTarget.querySelector('.help-tooltip') as HTMLElement); if (t) t.style.opacity = '1'; }}
            onMouseLeave={e => { const t = (e.currentTarget.querySelector('.help-tooltip') as HTMLElement); if (t) t.style.opacity = '0'; }}>
            <HelpCircle size={16} color="#94a3b8" style={{ cursor: 'help' }} />
            <span className="help-tooltip" style={{
              position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 6,
              background: '#1a1a2e', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '6px 10px',
              fontSize: '0.8rem', color: '#94a3b8', whiteSpace: 'nowrap', zIndex: 10, pointerEvents: 'none',
              opacity: 0, transition: 'opacity 0.2s',
            }}>
              Use code: acvid3
            </span>
          </span>
          <PremiumButton
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleActivatePremium}
          >
            Activate Premium
          </PremiumButton>
          <AnimatePresence>
            {showSuccess && (
              <SuccessMessage
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                Premium activated successfully!
              </SuccessMessage>
            )}
          </AnimatePresence>
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <h3>Crystals</h3>
        <div style={{ marginBottom: 10, fontSize: 18, color: '#e2e8f0' }}>
          Current balance: {state.user.crystals} <Gem size={16} style={{ verticalAlign: 'middle' }} />
          {crystalSec > 0 && state.user.crystals < 10 && (
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginLeft: 12 }}>
              Free <Gem size={14} style={{ verticalAlign: 'middle' }} /> in {Math.floor(crystalSec / 60)}:{String(crystalSec % 60).padStart(2, '0')}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => addCrystals(state.user.premium ? 6 : 5)}>
            {state.user.premium ? '5+1' : '5'} <Gem size={14} style={{ verticalAlign: 'middle' }} /> - $0.99
          </Button>
          <Button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => addCrystals(state.user.premium ? 18 : 15)}>
            {state.user.premium ? '15+3' : '15'} <Gem size={14} style={{ verticalAlign: 'middle' }} /> - $2.99
          </Button>
          <Button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => addCrystals(state.user.premium ? 60 : 50)}>
            {state.user.premium ? '50+10' : '50'} <Gem size={14} style={{ verticalAlign: 'middle' }} /> - $9.99
          </Button>
        </div>
      </div>
    </Panel>
  );
}
