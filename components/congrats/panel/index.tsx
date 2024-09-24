'use client';

import type { FC } from 'react';
import { useCongrats } from '@/components/congrats/hook';
import { PainterCard } from '@/components/painter-card';
import { FallbacksLoading } from '@/components/fallbacks/loading';
import { NotificationsHighlight } from '@/components/notifications/highlight';
import { ButtonsCvaAnchor } from '@/components/cva/anchor';
import { ButtonsCvaLink } from '@/components/cva/link';

export const ComponentsCongratsPanel: FC = () => {
  const congrats = useCongrats();
  const { isLoading, painterUserId, error } = congrats;
  return (
    <div className="fill-column-white text-center my-10">
      <div className="text-8xl">🎉</div>
      <h2 className="text-2xl font-medium">
        Congrats on accepting your quote with:
      </h2>
      {isLoading ? (
        <FallbacksLoading />
      ) : error ? (
        <NotificationsHighlight>
          <p className="text-red-500">{error}</p>
        </NotificationsHighlight>
      ) : (
        <>
          {painterUserId && (
            <PainterCard painterId={painterUserId} />
          )}
        </>
      )}
      <h2>
        They will reach out within two business days to
        schedule your job. If you have any questions, please
        contact us at:
      </h2>
      <a
        href="mailto:takeshapehome@gmail.com?subject=Contact%20DwellDone"
        className="text-center text-sm"
      >
        takeshapehome@gmail.com
      </a>
      <h2>or</h2>
      <ButtonsCvaAnchor
        title="Contact Support, Call (615) 809-6429"
        href="tel:+16158096429"
      >
        Contact Support
      </ButtonsCvaAnchor>

      <div className="absolute top-full translate-y-10">
        <ButtonsCvaLink
          title="Contact Support, Call (615) 809-6429"
          href="/"
          classValue="text-pink"
        >
          Continue
        </ButtonsCvaLink>
      </div>
    </div>
  );
};
