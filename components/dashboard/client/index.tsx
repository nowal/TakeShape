import { useRouter } from 'next/navigation';
import { ButtonsCvaButton } from '@/components/cva/button';
import { DashboardClientHeader } from '@/components/dashboard/client/header';
import { DashboardClientQuotes } from '@/components/dashboard/client/quotes';
import { DashboardClientUploading } from '@/components/dashboard/client/uploading';
import { DashboardClientVideo } from '@/components/dashboard/client/video';
import { DashboardNotificationsQuoteAccepted } from '@/components/dashboard/notifications';
import { IconsQuote } from '@/components/icons/quote';
import { useDashboard } from '@/context/dashboard/provider';
import { isString } from '@/utils/validation/is/string';
import { cx } from 'class-variance-authority';
import type { FC } from 'react';

export const DashboardClient: FC = () => {
  const router = useRouter();

  const dashboard = useDashboard();
  const {
    userImageList,
    uploadStatus,
    userData,
    acceptedQuote,
    onAcceptQuote,
    onQuoteChange,
    preferredPainterUserIds,
    selectedUserImage,
    agentInfo,
  } = dashboard;
  const preferencesTitle = 'Your Quote’s Preferences';
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
      <div
        className={cx("flex flex-col items-stretch p-5 bg-white rounded-2xl",'gap-5')}
        style={{
          boxShadow:
            '0px 4px 90.8px 0px rgba(0, 0, 0, 0.08)',
        }}
      >
        {userData && userData.video && (
          <DashboardClientVideo />
        )}
        <div>
          <div className="flex flex-row">
            <h4
              className={cx(
                'text-black',
                'font-semibold font-base font-open-sans',
                'w-full',
                'truncate'
              )}
            >
              {userData?.title}
            </h4>
          </div>
          <div className="flex flex-row">
            {userData?.reAgent}
          </div>
        </div>
        <div
          className={cx(
            'relative',
            'rounded-xl bg-white w-full'
          )}
          style={{
            height: 68,
            boxShadow:
              '0px 4.288px 28.623px 0px rgba(0, 0, 0, 0.09)',
          }}
        >
          <ButtonsCvaButton
            title={preferencesTitle}
            onTap={() =>
              router.push(
                `/defaultPreferences?userImageId=${selectedUserImage}`
              )
            }
            size="fill"
            center
          >
            <div
              className={cx(
                'flex flex-row',
                'items-center',
                'gap-2'
              )}
            >
              <IconsQuote />
              <span>{preferencesTitle}</span>
            </div>
          </ButtonsCvaButton>
        </div>
      </div>
    </div>
  );
};
