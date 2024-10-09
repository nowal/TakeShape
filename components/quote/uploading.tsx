import { useDashboard } from '@/context/dashboard/provider';
import { formatUploading } from '@/utils/format/uploading';
import type { FC } from 'react';

export const DashboardHomeownerUploading: FC = () => {
  const dashboard = useDashboard();
  const { uploadProgress } = dashboard;
  return <p>{formatUploading(uploadProgress)}</p>;
};
