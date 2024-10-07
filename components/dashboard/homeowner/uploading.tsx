import { NotificationsInlineHighlight } from '@/components/notifications/inline/highlight';
import { useDashboard } from '@/context/dashboard/provider';
import type { FC } from 'react';

export const DashboardHomeownerUploading: FC = () => {
  const dashboard = useDashboard();
  const { uploadProgress } = dashboard;
  return (
    <NotificationsInlineHighlight>
      Uploading: {uploadProgress.toFixed(2)}%
    </NotificationsInlineHighlight>
  );
};
