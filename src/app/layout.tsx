'use client';

import { useState, useEffect } from 'react';
import { GameProvider } from '@/context/GameContext';
import { FaLinkedin } from 'react-icons/fa';
import './globals.css';

function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div style={{ minHeight: '100vh', background: '#0f0c29' }} />;
  return <>{children}</>;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientOnly>
          <GameProvider>
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
              <div style={{ flex: 1 }}>{children}</div>
              <footer style={{
                textAlign: 'center', padding: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                color: '#94a3b8', fontSize: '0.85rem',
              }}>
                <a href="https://www.linkedin.com/in/acvid3/" target="_blank" rel="noopener noreferrer"
                  style={{ color: '#818cf8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <FaLinkedin size={16} /> acvid3
                </a>
              </footer>
            </div>
          </GameProvider>
        </ClientOnly>
      </body>
    </html>
  );
}
