'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { MonetizationPanel } from '@/components/MonetizationPanel';

const Page = styled.div`
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
    background-image: url('/backgrounds/monetization-bg.jpg');
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

export default function MonetizationPage() {
  return (
    <Page>
      <Header>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <BackBtn whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <ArrowLeft size={16} /> Back
          </BackBtn>
        </Link>
      </Header>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <MonetizationPanel />
      </div>
    </Page>
  );
}
