import { NotificationsInlineHighlight } from '@/components/notifications/inline/highlight';
import { TDivProps } from '@/types/dom';
import type { FC } from 'react';

export const ComponentsAccountSettingsNotifications: FC<
  TDivProps
> = ({ children, ...props }) => {
  return (
    <NotificationsInlineHighlight>
      <>
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline text-left">{children}</span>
      </>
    </NotificationsInlineHighlight>
  );
};
