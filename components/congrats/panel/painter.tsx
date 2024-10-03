import { useCongrats } from '@/components/congrats/hook';
import { PainterCardData } from '@/components/painter/card/data';
import type { FC } from 'react';

export const CongratsPanelPainter: FC = () => {
  const congrats = useCongrats();
  const { painterId } = congrats;
  if (!painterId) return null;
  return <PainterCardData painterId={painterId} />;
};
