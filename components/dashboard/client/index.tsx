import { TUploadStatusKey } from '@/atom/types';
import { TButtonsCvaButtonProps } from '@/components/cva/button';
import { DashboardClientQuotes } from '@/components/dashboard/client/quotes';
import { DashboardFooter } from '@/components/dashboard/footer';
import { DashboardNotificationsQuoteAccepted } from '@/components/dashboard/notifications';
import {
  TAcceptQuoteHandler,
  TAgentInfo,
  TPrice,
  TUserData,
  TUserImage,
} from '@/types/types';
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
  preferredPainterUserIds,
  agentInfo,
  selectedUserImage,
}) => {
  return (
    <div className="flex flex-col items-center w-full max-w-4xl">
      <div className="flex items-center mb-4">
        {/* <select
          className="text-3xl font-medium p-2 underline"
          value={selectedUserImage}
          onChange={handleQuoteChange}
          style={{
            fontSize: '2rem',
            fontWeight: 'bold',
          }}
        >
          {userImageList.map((image, index) => (
            <option key={index} value={image.id}>
              {image.title}
            </option>
          ))}
        </select> */}
        <button
          onClick={() => router.push('/quote')}
          className="ml-2 text-3xl font-bold text-green-700 hover:text-green-900"
          title="Add New Quote"
        >
          +
        </button>
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
