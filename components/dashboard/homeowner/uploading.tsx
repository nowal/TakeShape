import { NotificationsHighlight } from '@/components/notifications/highlight';
import { useDashboard } from '@/context/dashboard/provider';
import type { FC } from 'react';

export const DashboardHomeownerUploading: FC = () => {
  const dashboard = useDashboard();
  const { uploadProgress } = dashboard;
  return (
    <NotificationsHighlight>
      Uploading: {uploadProgress.toFixed(2)}%
    </NotificationsHighlight>
  );
};
