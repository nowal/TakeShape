import type { FC } from 'react';
import { NotificationsHighlight } from '@/components/notifications/highlight';

export const PreferencesNotificationsInformation: FC =
  () => {
    return (
      <NotificationsHighlight>
        None of your information will be shared with
        painters until you accept a quote. Rest assured,
        your privacy is our priority.
      </NotificationsHighlight>
    );
  };
