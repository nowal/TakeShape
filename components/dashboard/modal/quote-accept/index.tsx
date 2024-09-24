import {
  ButtonsCheckout,
  TButtonsCheckoutProps,
} from '@/components/buttons/checkout';
import { TButtonsCvaButtonProps } from '@/components/cva/button';
import { DashboardModalQuoteAcceptNameRow } from '@/components/dashboard/modal/quote-accept/name-row';
import { IconsInfo } from '@/components/icons/info';
import { IconsSecure } from '@/components/icons/secure';
import { LinesHorizontal } from '@/components/lines/horizontal';
import { ComponentsModal } from '@/components/modal';
import { ComponentsModalPanel } from '@/components/modal/panel';
import { ComponentsPortalBody } from '@/components/portal/body';
import { useDashboard } from '@/context/dashboard/provider';
import type { FC } from 'react';

type TProps = {
  checkoutButtonProps: TButtonsCheckoutProps;
};
export const DashboardModalQuoteAccept: FC<TProps> = ({
  checkoutButtonProps,
}) => {
  const dashboard = useDashboard();
  const { selectedQuoteAmount, dispatchShowModal } =
    dashboard;
  const handleCloseModal = () => dispatchShowModal(false);
  const depositFraction = 0.1;
  const depositAmount =
    selectedQuoteAmount * depositFraction;
  const remainingFraction = 1 - depositFraction;
  const remainingAmount =
    selectedQuoteAmount * remainingFraction;

  return (
    <ComponentsPortalBody>
      <ComponentsModal>
        <ComponentsModalPanel
          title="Deposit"
          // title="Congrats on accepting your quote!"
          classValue="gap-5"
          closeProps={{
            title: 'Close',
            onTap: handleCloseModal,
          }}
        >
          <p className="text-center text-xs font-semibold text-gray-7 px-10">
            We require a 10% deposit to safeguard the
            painter&apos;s time and commitment. Rest
            assured, this amount will be deducted from your
            final quoted price once the job is completed to
            your satisfaction.
          </p>
          <div className="flex flex-col items-center gap-1">
            <h5 className="text-gray-9 text-xs font-semibold">
              Deposit amount
            </h5>
            <div className="text-2xl text-black">
              ${depositAmount}
            </div>
            <div className="text-gray-7 flex flex-row gap-1.5">
              <h6 className="text-xs font-medium">
                Pay after the deposit
              </h6>
              <div className="flex flex-row gap-1.5">
                <p className="text-black text-xs font-medium">
                  ${remainingAmount}
                </p>
                <div title={`${remainingFraction * 100}%`}>
                  <IconsInfo />
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-stretch gap-4">
            <DashboardModalQuoteAcceptNameRow
              head="From"
              tail="Katherine Bond"
            />
            <LinesHorizontal colorClass="border-gray-13" />
            <DashboardModalQuoteAcceptNameRow
              head="To"
              tail="Noah Waldron"
            />
          </div>
          <ButtonsCheckout {...checkoutButtonProps} />
          <div className="flex flex-row justify-center gap-1.5">
            <IconsSecure />
            <p className="text-gray-7 text-xs font-semibold">
              The payment method is verified.
            </p>
          </div>
        </ComponentsModalPanel>
      </ComponentsModal>
    </ComponentsPortalBody>
  );
};