import { useDashboard } from '@/context/dashboard/provider';
import type { FC } from 'react';

export const DashboardHomeownerUploading: FC = () => {
  const dashboard = useDashboard();
  const { uploadProgress } = dashboard;
  return (
    <div className="upload-progress mb-4 text-center">
      <p className="text-xl font-bold p-2">
        Uploading: {uploadProgress.toFixed(2)}%
      </p>
    </div>
  );
};
