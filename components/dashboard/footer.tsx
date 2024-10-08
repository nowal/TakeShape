import type { FC } from 'react';
import { useRouter } from 'next/navigation';
import { ButtonsCvaButton } from '@/components/cva/button';
import { ButtonsCvaLink } from '@/components/cva/link';

export const DashboardFooter: FC = () => {
  const router = useRouter();
  const resubmitTitle = 'Resubmit Video';

  return (
    <div className="button-group my-4 flex justify-center gap-4">
      <ButtonsCvaLink
        title={resubmitTitle}
        href="/quote"
        size="sm"
        intent="primary"
      >
        {resubmitTitle}
      </ButtonsCvaLink>
    </div>
  );
};
