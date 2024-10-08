import { NotificationsInlineHighlight } from '@/components/notifications/inline/highlight';
import { useDashboard } from '@/context/dashboard/provider';
import { formatUploading } from '@/utils/format/uploading';
import type { FC } from 'react';

export const DashboardHomeownerUploading: FC = () => {
  const dashboard = useDashboard();
  const { uploadProgress } = dashboard;
  return (
    <NotificationsInlineHighlight>
      {formatUploading(uploadProgress)}
    </NotificationsInlineHighlight>
  );
};
