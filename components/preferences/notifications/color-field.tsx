import { NotificationsInlineHighlight } from '@/components/notifications/inline/highlight';
import type { FC } from 'react';

export const PreferencesNotificationsColorField: FC = () => {
  return (
    <NotificationsInlineHighlight>
      <span className="help-link text-sm">Undecided?</span>
      <span className="tooltiptext">
        Type &quot;Undecided&quot; in the color field and the painter
        you choose can help you with choosing a color.
      </span>
    </NotificationsInlineHighlight>
  );
};
