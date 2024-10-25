'use client';
import { FC, Suspense } from 'react';
import { ComponentsCongrats } from '@/components/congrats';
import { useAuthNavigateHome } from '@/hooks/auth/navigate/home';
import { PainterCardBackground } from '@/components/painter/card/background';
import { PainterCardData } from '@/components/painter/card/data';
import { useCongrats } from '@/components/congrats/hook';
import { FallbacksLogoFill } from '@/components/fallbacks/logo/fill';

const CongratsWithSuspense: FC = () => {
  const congrats = useCongrats();
  const { painterId } = congrats;
  useAuthNavigateHome();

  return (
    <Suspense fallback={<FallbacksLogoFill />}>
      <ComponentsCongrats>
        {painterId && (
          <PainterCardBackground>
            <PainterCardData painterId={painterId} />
          </PainterCardBackground>
        )}
      </ComponentsCongrats>
    </Suspense>
  );
};

export default CongratsWithSuspense;
