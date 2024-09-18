import { NotificationsHighlight } from '@/components/notifications/highlight';
import type { FC } from 'react';

type TProps = { children: string };
export const SignUpNotificationsError: FC<TProps> = ({
  children,
}) => {
  return (
    <NotificationsHighlight role="alert">
      <strong className="font-bold">Error: </strong>
      <span className="block sm:inline">{children}</span>
    </NotificationsHighlight>
  );
};
