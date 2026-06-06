import styled from 'styled-components';

export const GameLayout = styled.div`
  display: flex;
  gap: 32px;
  justify-content: center;
  align-items: flex-start;
  padding: 32px;
  max-width: 800px;
  margin: 0 auto;
  @media (max-width: 768px) { flex-direction: column; align-items: center; padding: 16px; gap: 20px; }
`;

export const GameSection = styled.div`
  text-align: center;
`;

export const Legend = styled.div`
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 20px;
  min-width: 200px;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  @media (max-width: 768px) { width: 100%; min-width: unset; }
`;

export const LegendTitle = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #e2e8f0;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
`;

export const LegendItem = styled.div<{ $color?: string }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  font-size: 0.85rem;
  &:last-child { border-bottom: none; }
`;

export const ColorDot = styled.div<{ $color: string }>`
  width: 12px;
  height: 12px;
  background: ${p => p.$color};
  flex-shrink: 0;
`;

export const LegendLabel = styled.div`
  color: #94a3b8;
  flex: 1;
`;

export const LegendValue = styled.div`
  color: #e2e8f0;
  font-weight: 500;
  text-align: right;
`;
