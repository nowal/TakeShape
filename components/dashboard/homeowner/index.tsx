import { DashboardHomeownerHeader } from '@/components/dashboard/homeowner/header';
import { DashboardHomeownerUploading } from '@/components/dashboard/homeowner/uploading';
import { useDashboard } from '@/context/dashboard/provider';
import { isString } from '@/utils/validation/is/string';
import { cx } from 'class-variance-authority';
import type { FC } from 'react';
import { DashboardHomeownerQuote } from '@/components/dashboard/homeowner/quote';
import { DashboardModalQuoteAccept } from '@/components/dashboard/modal/quote-accept';
import { DashboardHomeownerContractorQuotes } from '@/components/dashboard/homeowner/contractor-quotes';
import { ComponentsDashboardLayout } from '@/components/dashboard/layout';
import { ComponentsCongratsPanel } from '@/components/congrats/panel';
import { PainterCardData } from '@/components/painter/card/data';
import { PainterCardBackground } from '@/components/painter/card/background';

export const DashboardHomeowner: FC = () => {
  const dashboard = useDashboard();
  const { userImageList, uploadStatus, onQuoteChange } =
    dashboard;
  const {
    isShowModal,
    selectedQuoteAmount,
    userData,
    acceptedQuote,
  } = dashboard;
  const isDepositScreen =
    selectedQuoteAmount > 0 && isShowModal;
  return (
    <ComponentsDashboardLayout
      key="ComponentsDashboardLayout"
      first={
        <div
          className={cx(
            'flex flex-col items-stretch w-full max-w-4xl',
            'gap-3.5'
          )}
        >
          <DashboardHomeownerHeader
            onValueChange={(_, value) =>
              isString(value) ? onQuoteChange(value) : null
            }
            idValues={userImageList}
          />
          {uploadStatus === 'uploading' && (
            <DashboardHomeownerUploading />
          )}
          <DashboardHomeownerQuote />
        </div>
      }
      second={
        <>
          {acceptedQuote ? (
            <ComponentsCongratsPanel>
              <PainterCardBackground>
                <PainterCardData
                  painterId={acceptedQuote.painterId}
                />
              </PainterCardBackground>
            </ComponentsCongratsPanel>
          ) : (
            <>
              {userData && userData.prices && (
                <DashboardHomeownerContractorQuotes />
              )}
            </>
          )}
        </>
      }
    >
      {isDepositScreen && <DashboardModalQuoteAccept />}
    </ComponentsDashboardLayout>
  );
};
