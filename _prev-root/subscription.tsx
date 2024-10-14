import { LandingButtonsSubmit } from '@/_prev-root/buttons/submit';
import { useLanding } from '@/_prev-root/landing/provider';
import type { FC } from 'react';

export const LandingSubscription: FC = () => {
  const landing = useLanding();

  const {
    emailForSubscription,
    onSubscription,
    dispatchImageUrls,
    dispatchEmailForSubscription,
  } = landing;

  return (
    <div className="flex gap-4 items-center">
      <input
        type="email"
        value={emailForSubscription}
        onChange={(e) =>
          dispatchEmailForSubscription(e.target.value)
        }
        placeholder="Email address"
        className="p-2 border rounded w-full sm:w-auto"
      />
      <LandingButtonsSubmit />
    </div>
  );
};
