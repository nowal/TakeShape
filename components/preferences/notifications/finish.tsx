import { NotificationsHighlight } from '@/components/notifications/highlight';
import type { FC } from 'react';

export const PreferencesNotificationsFinish: FC = () => {
  return (
      <NotificationsHighlight>
        ?
        <span className="tooltiptext">
          We default to eggshell finish because of its
          versatility, but you are welcome to pick whatever
          finish you prefer
        </span>
      </NotificationsHighlight>
  );
};
