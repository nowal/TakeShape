import { useDashboard } from '@/context/dashboard/provider';
import { formatUploading } from '@/utils/format/uploading';
import type { FC } from 'react';

export const DashboardHomeownerUploading: FC = () => {
  const dashboard = useDashboard();
  return <p>{formatUploading(dashboard.uploadProgress)}</p>;
};
