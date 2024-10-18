import type { FC } from 'react';
import { TJobTypeProps } from '@/components/dashboard/painter/types';
import { NotificationsInlineHighlight } from '@/components/notifications/inline/highlight';

type TProps = TJobTypeProps;
export const DashboardPainterJobsEmpty: FC<TProps> = ({
  typeKey,
}) => {
  return (
    <NotificationsInlineHighlight>
      No {typeKey} quotes at this time
    </NotificationsInlineHighlight>
  );
};
