import type { FC } from 'react';
import { ButtonsCvaAnchor } from '@/components/cva/anchor';
import { TJob } from '@/types';
import { getAuth } from 'firebase/auth';

type TProps = TJob;
export const DashboardPainterJobInvoice: FC<TProps> = (
  job
) => {
  const title = 'Invoice';
  const auth = getAuth();
  const user = auth.currentUser;

  const invoiceUrl = job.prices.find(
    (price) => price.painterId === user?.uid
  )?.invoiceUrl;
  return (
    <ButtonsCvaAnchor
      href={invoiceUrl}
      target="_blank"
      rel="noopener noreferrer"
      classValue="mt-0.25"
      title={title}
    >
      <div className="text-black text-xs font-semibold p-0.5">
        {title}
      </div>
    </ButtonsCvaAnchor>
  );
};
