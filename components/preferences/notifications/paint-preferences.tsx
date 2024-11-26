import { NotificationsInlineHighlight } from '@/components/notifications/inline/highlight';
import type { FC } from 'react';

export const PreferencesNotificationsPaintPreferences: FC =
  () => {
    return (
      <NotificationsInlineHighlight>
        <strong className="font-bold">Warning: </strong>
        <span className="block sm:inline">
          If you modify your paint preferences, then your
          existing quotes may not be valid.
        </span>
      </NotificationsInlineHighlight>
    );
  };
