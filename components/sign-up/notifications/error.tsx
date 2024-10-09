import { NotificationsInlineHighlight } from '@/components/notifications/inline/highlight';
import type { FC } from 'react';

type TProps = { children: string };
export const SignUpNotificationsError: FC<TProps> = ({
  children,
}) => {
  return (
    <NotificationsInlineHighlight role="alert">
      <strong className="font-bold">Error: </strong>
      <span className="block sm:inline text-left">{children}</span>
    </NotificationsInlineHighlight>
  );
};
