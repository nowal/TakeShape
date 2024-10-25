import type { FC } from 'react';
import { CvaLink } from '@/components/cva/link';

export const DashboardFooter: FC = () => {
  const resubmitTitle = 'Resubmit Video';

  return (
    <div className="button-group my-4 flex justify-center gap-4">
      <CvaLink
        title={resubmitTitle}
        href="/quote"
        size="sm"
        intent="primary"
      >
        {resubmitTitle}
      </CvaLink>
    </div>
  );
};
