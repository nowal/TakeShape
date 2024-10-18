import type { FC } from 'react';
import { cx } from 'class-variance-authority';
import { DashboardHomeownerHeader } from '@/components/dashboard/homeowner/header';
import { useDashboard } from '@/context/dashboard/provider';
import { isString } from '@/utils/validation/is/string';
import { DashboardHomeownerQuote } from '@/components/dashboard/homeowner/quote';
import { ComponentsDashboardLayout } from '@/components/dashboard/layout';
import { DashboardHomeownerContractorQuotesList } from '@/components/dashboard/homeowner/contractor-quotes/list';
import { TDashboardHomeownerContractorQuotesListItemsProps } from '@/components/dashboard/homeowner/contractor-quotes/list/items';
import { DashboardHomeownerVideoContainer } from '@/components/dashboard/homeowner/video/container';
import { DashboardHomeownerVideoDisplay } from '@/components/dashboard/homeowner/video/display';

type TProps =
  TDashboardHomeownerContractorQuotesListItemsProps;
export const DashboardHomeownerPlaceholder: FC<TProps> = (
  dashboardHomeownerContractorQuotesListProps
) => {
  const dashboard = useDashboard();
  const { userImageList, onQuoteChange } = dashboard;
  const { selectedUserImage } = dashboard;

  return (
    <>
      <ComponentsDashboardLayout
        first={
          <div className="pl-3.5 pb-3.5">
            <DashboardHomeownerHeader
              onValueChange={(_, value) => {
                if (isString(value)) {
                  onQuoteChange(value);
                }
              }}
              value={selectedUserImage}
              idValues={userImageList}
            />
          </div>
        }
      />
      <ComponentsDashboardLayout
        key="ComponentsDashboardLayout"
        first={
          <div
            className={cx(
              'flex flex-col items-stretch w-full max-w-4xl',
              'gap-3.5'
            )}
          >
            <DashboardHomeownerQuote>
              <DashboardHomeownerVideoContainer>
                <DashboardHomeownerVideoDisplay src="/landing/problem-and-decision/mock.mp4" />
              </DashboardHomeownerVideoContainer>
            </DashboardHomeownerQuote>
          </div>
        }
        second={
          <DashboardHomeownerContractorQuotesList
            {...dashboardHomeownerContractorQuotesListProps}
          />
        }
      />
    </>
  );
};
