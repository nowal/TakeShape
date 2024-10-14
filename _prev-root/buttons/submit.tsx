import { ButtonsCvaButton } from '@/components/cva/button';
import { useLanding } from '@/_prev-root/landing/provider';
import type { FC } from 'react';

export const LandingButtonsSubmit: FC = () => {
  const landing = useLanding();
  const {
    emailForSubscription,
    onSubscription,
    dispatchImageUrls,
    dispatchEmailForSubscription,
  } = landing;

  const title = 'Subscribe';
  return (
    <ButtonsCvaButton
      onClick={onSubscription}
      intent="primary"
      size="md"
      title={title}
    >
      {title}
    </ButtonsCvaButton>
  );
};
