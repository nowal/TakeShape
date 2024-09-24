'use client';
import type { FC } from 'react';
import { ButtonsCvaAnchor } from '@/components/cva/anchor';
import { ButtonsCvaLink } from '@/components/cva/link';
import { ComponentsModalPanel } from '@/components/modal/panel';
import { CongratsPanelPainter } from '@/components/congrats/panel/painter';

export const ComponentsCongratsPanel: FC = () => {
  return (
    <ComponentsModalPanel classValue="text-center">
      <div className="flex flex-col gap-5">
        <div className="text-8xl">🎉</div>
        <div className="flex flex-col gap-2">
          <h2 className="text-base font-bold text-black px-2">
            Congratulations on accepting your quote!
          </h2>
          <p className="text-gray-7 text-sm">
            Contractor will reach out within two days to
            schedule your job. If you have any questions,
            please contact us or you call your contractor
            directly.
          </p>
        </div>
        <CongratsPanelPainter />
        <ButtonsCvaAnchor
          title="Contact Support, Call (615) 809-6429"
          href="tel:+16158096429"
          center
        >
          <span className="text-gray-7 font-semibold">
            Contact Support
          </span>
        </ButtonsCvaAnchor>
      </div>

      <div className="absolute left-0 top-full w-full translate-y-8">
        <ButtonsCvaLink
          title="Contact Support, Call (615) 809-6429"
          href="/"
          center
        >
          <span className="font-semibold text-pink">
            Continue
          </span>
        </ButtonsCvaLink>
      </div>
    </ComponentsModalPanel>
  );
};
