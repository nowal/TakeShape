import { ButtonsCheckout } from '@/components/buttons/checkout';
import { IconsInfo } from '@/components/icons/info';
import { IconsSecure } from '@/components/icons/secure';
import { ComponentsModal } from '@/components/modal';
import { ComponentsPanel } from '@/components/panel';
import { ComponentsPortalBody } from '@/components/portal/body';
import { useDashboard } from '@/context/dashboard/provider';
import type { FC } from 'react';

export const DashboardModalQuoteAccept: FC = () => {
  const dashboard = useDashboard();
  const {
    painterId,
    selectedQuoteAmount,
    selectedUserImage,
    dispatchShowModal,
  } = dashboard;
  const handleCloseModal = () => dispatchShowModal(false);
  const depositFraction = 0.1;
  const depositAmount = Math.round(
    selectedQuoteAmount * depositFraction
  );
  const remainingFraction = 1 - depositFraction;
  const remainingAmount = Math.round(
    selectedQuoteAmount * remainingFraction
  );

  return (
    <ComponentsPortalBody>
      <ComponentsModal>
        <ComponentsPanel
          title="Deposit"
          // title="Congrats on accepting your quote!"
          classValue="gap-5"
          closeProps={{
            title: 'Close',
            onTap: handleCloseModal,
          }}
        >
          <p className="text-center text-xs font-semibold text-gray-7 px-10">
            To secure your quote and protect the painter&apos;s time,
            we hold a 10% deposit.
            Your deposit is held until the work is completed to your satisfaction 
            at which point you will pay the painter the remainder 
            of your quoted price.
          </p>
          <div className="flex flex-col items-center gap-1">
            <h5 className="text-gray-9 text-xs font-semibold">
              Deposit amount
            </h5>
            <div className="text-2xl text-black">
              ${depositAmount.toLocaleString()}
            </div>
            <div className="text-gray-7 flex flex-row gap-1.5">
              <h6 className="text-xs font-medium">
                Pay after the deposit
              </h6>
              <div className="flex flex-row gap-1.5">
                <p className="text-black text-xs font-medium">
                  ${remainingAmount.toLocaleString()}
                </p>
                <div title={`${remainingFraction * 100}%`}>
                  <IconsInfo />
                </div>
              </div>
            </div>
          </div>
          {/* <div className="flex flex-col items-stretch gap-4">
            <DashboardModalQuoteAcceptNameRow
              head="From"
              tail="Katherine Bond"
            />
            <LinesHorizontal colorClass="border-gray-13" />
            <DashboardModalQuoteAcceptNameRow
              head="To"
              tail="Noah Waldron"
            />
          </div> */}
          <ButtonsCheckout
            selectedQuoteAmount={selectedQuoteAmount}
            painterId={painterId} // Make sure this is the correct painterId
            userImageId={selectedUserImage} // Make sure this is the correct userImageId
            userId={selectedUserImage}
            depositAmount={depositAmount}
            remainingAmount={remainingAmount}
          />
          {/*<div className="flex flex-row justify-center gap-1.5">
            <IconsSecure />
            <p className="text-gray-7 text-xs font-semibold">
              The payment method is verified.
            </p>
          </div>*/}
        </ComponentsPanel>
      </ComponentsModal>
    </ComponentsPortalBody>
  );
};
