import { TUploadStatusKey } from '@/atom/types';
import { ButtonsCvaButton } from '@/components/cva/button';
import { DashboardClientQuotes } from '@/components/dashboard/client/quotes';
import { DashboardFooter } from '@/components/dashboard/footer';
import { DashboardNotificationsQuoteAccepted } from '@/components/dashboard/notifications';
import { IconsPlus } from '@/components/icons/plus';
import { InputsSelect } from '@/components/inputs/select';
import {
  TAcceptQuoteHandler,
  TAgentInfo,
  TPrice,
  TQuoteChangeHandler,
  TUserData,
  TUserImage,
} from '@/types/types';
import { isString } from '@/utils/validation/is/string';
import router from 'next/router';
import type { FC } from 'react';

export type TDashboardClientProps = {
  videoRef: any;
  userImageList: TUserImage[];
  uploadStatus: TUploadStatusKey;
  userData: TUserData | null;
  uploadProgress: number;
  acceptedQuote: TPrice | null;
  onAcceptQuote: TAcceptQuoteHandler;
  onQuoteChange: TQuoteChangeHandler;
  preferredPainterUserIds: any;
  agentInfo: TAgentInfo;
  selectedUserImage: string;
};
export const DashboardClient: FC<TDashboardClientProps> = ({
  videoRef,
  uploadStatus,
  userImageList,
  userData,
  uploadProgress,
  acceptedQuote,
  onAcceptQuote,
  onQuoteChange,
  preferredPainterUserIds,
  agentInfo,
  selectedUserImage,
}) => {
  console.log(userData);
  return (
    <div className="flex flex-col items-center w-full max-w-4xl">
      <div className="flex items-center mb-4">
        <InputsSelect
          name="quote-change"
          placeholder="Select Quote"
          onValueChange={(_, value) =>
            isString(value) ? onQuoteChange(value) : null
          }
          idValues={userImageList}
        />
        <ButtonsCvaButton
          onTap={() => router.push('/quote')}
          // className="ml-2 text-3xl font-bold text-green-700 hover:text-green-900"
          title="Add New Quote"
        >
          <IconsPlus />
        </ButtonsCvaButton>
      </div>
      {uploadStatus === 'uploading' && (
        <div className="upload-progress mb-4 text-center">
          <p className="text-xl font-bold p-2">
            Uploading: {uploadProgress.toFixed(2)}%
          </p>
        </div>
      )}
      {userData && userData.video && (
        <div
          className="video-container mb-2"
          style={{ maxWidth: '100%' }}
        >
          <video
            controls
            playsInline
            muted={true}
            ref={videoRef}
            src={`${userData.video}#t=0.001`}
            className="video"
            style={{ width: '100%', maxWidth: '100%' }}
            onLoadedMetadata={() => {
              if (videoRef.current) {
                videoRef.current.playbackRate = 1.0;
              }
            }}
          />
        </div>
      )}
      {acceptedQuote ? (
        <DashboardNotificationsQuoteAccepted
          painterId={acceptedQuote.painterId}
        />
      ) : (
        userData &&
        userData.prices && (
          <DashboardClientQuotes
            prices={userData.prices}
            agentInfo={agentInfo}
            preferredPainterUserIds={
              preferredPainterUserIds
            }
            onAcceptQuote={onAcceptQuote}
          />
        )
      )}
      <DashboardFooter
        selectedUserImage={selectedUserImage}
      />
    </div>
  );
};
