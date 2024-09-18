import { DashboardClientHeader } from '@/components/dashboard/client/header';
import { DashboardClientQuotes } from '@/components/dashboard/client/quotes';
import { DashboardClientUploading } from '@/components/dashboard/client/uploading';
import { DashboardClientVideo } from '@/components/dashboard/client/video';
import { DashboardNotificationsQuoteAccepted } from '@/components/dashboard/notifications';
import { useDashboard } from '@/context/dashboard/provider';
import { isString } from '@/utils/validation/is/string';
import { cx } from 'class-variance-authority';
import type { FC } from 'react';

export const DashboardClient: FC = () => {
  const dashboard = useDashboard();
  const {
    userImageList,
    uploadStatus,
    userData,
    acceptedQuote,
    onAcceptQuote,
    onQuoteChange,
    preferredPainterUserIds,
    agentInfo,
  } = dashboard;
  return (
    <div
      className={cx(
        'flex flex-col items-stretch w-full max-w-4xl',
        'gap-3.5'
      )}
    >
      <DashboardClientHeader
        onValueChange={(_, value) =>
          isString(value) ? onQuoteChange(value) : null
        }
        idValues={userImageList}
      />
      {uploadStatus === 'uploading' && (
        <DashboardClientUploading />
      )}
      <div className="p-5 bg-white rounded-2xl shadow-08">
        {userData && userData.video && (
          <DashboardClientVideo />
        )}
      </div>
    </div>
  );
};
