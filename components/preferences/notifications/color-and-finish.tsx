import { NotificationsHighlight } from '@/components/notifications/highlight';
import type { FC } from 'react';

export const PreferencesNotificationsColorAndFinish: FC = () => {
  return (
    <NotificationsHighlight>
      ?
      <span className="tooltiptext">
        This color and finish are the most standard for
        ceilings, but you are welcome to pick your own.
      </span>
    </NotificationsHighlight>
  );
};
