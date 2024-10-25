import type { FC } from 'react';
import { CvaLink } from '@/components/cva/link';

export const ComponentsCongratsPanelContinue: FC = () => {
  return (
    <div className="absolute left-0 top-full w-full translate-y-8">
      <CvaLink title="Continue" href="/" center>
        <span className="text-xs font-semibold text-pink">
          Continue
        </span>
      </CvaLink>
    </div>
  );
};
