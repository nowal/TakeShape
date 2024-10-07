import { NotificationsInlineHighlight } from '@/components/notifications/inline/highlight';
import type { FC } from 'react';

export const PreferencesNotificationsFinish: FC = () => {
  return (
      <NotificationsInlineHighlight>
        ?
        <span className="tooltiptext">
          We default to eggshell finish because of its
          versatility, but you are welcome to pick whatever
          finish you prefer
        </span>
      </NotificationsInlineHighlight>
  );
};
