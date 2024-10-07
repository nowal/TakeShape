import { NotificationsInlineHighlight } from '@/components/notifications/inline/highlight';
import { TDivProps } from '@/types/dom';
import type { FC } from 'react';

export const ComponentsAccountSettingsNotifications: FC<
  TDivProps
> = ({ children, ...props }) => {
  return (
    // <div
    //   className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
    //   role="alert"
    //   {...props}
    // >
    //   <strong className="font-bold">Error: </strong>
    //   <span className="block sm:inline">{children}</span>
    // </div>
    <NotificationsInlineHighlight>
      <>
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{children}</span>
      </>
    </NotificationsInlineHighlight>
  );
};
