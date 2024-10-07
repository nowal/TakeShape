import { NotificationsInlineHighlight } from '@/components/notifications/inline/highlight';
import type { FC } from 'react';

export const PreferencesNotificationsTrimFinish: FC =
  () => {
    return (
      <NotificationsInlineHighlight>
        {/* ? */}
        This color and finish are the most standard for
        trim, but you are welcome to pick your own.
      </NotificationsInlineHighlight>
    );
  };
