import { NotificationsHighlight } from '@/components/notifications/highlight';
import type { FC } from 'react';

export const PreferencesNotificationsTrimFinish: FC =
  () => {
    return (
      <NotificationsHighlight>
        ?
        <span className="tooltiptext">
          This color and finish are the most standard for
          trim, but you are welcome to pick your own.
        </span>
      </NotificationsHighlight>
    );
  };
