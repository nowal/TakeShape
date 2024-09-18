import {
  CheckoutButton,
  TCheckoutButtonProps,
} from '@/components/buttons/checkoutButton';
import { Modal } from '@/components/modal';
import { TButtonProps } from '@/types/dom';
import type { FC } from 'react';

type TProps = {
  checkoutButtonProps: TCheckoutButtonProps;
  closeButtonProps: TButtonProps;
};
export const DashboardModalQuoteAccepted: FC<TProps> = ({
  checkoutButtonProps,
  closeButtonProps,
}) => {
  return (
    <Modal>
      <div className="modal-overlay">
        <div className="modal-content">
          <button
            className="close-button"
            aria-label="Close"
            {...closeButtonProps}
          >
            &times;
          </button>
          <h2>Congrats on accepting your quote!</h2>
          <p>
            We hold a 10% deposit in order to protect our
            painter's time. This will be applied towards
            your quoted price after the work is completed!
          </p>
          <CheckoutButton {...checkoutButtonProps} />
        </div>
      </div>
    </Modal>
  );
};
