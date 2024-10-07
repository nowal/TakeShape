import type { FC } from 'react';
import { NotificationsInlineHighlight } from '@/components/notifications/inline/highlight';

export const PreferencesNotificationsInlineInformation: FC =
  () => {
    return (
      <NotificationsInlineHighlight>
        None of your information will be shared with
        painters until you accept a quote. Rest assured,
        your privacy is our priority.
      </NotificationsInlineHighlight>
    );
  };
