import { PainterCard } from '@/components/painter/card';
import type { FC } from 'react';

type TProps = { painterId: string };
export const DashboardNotificationsQuoteAccepted: FC<
  TProps
> = ({ painterId }) => {
  return (
    <div className="text-center my-10">
      <h2 className="text-2xl font-medium">
        Congrats on accepting your quote with:
      </h2>
      <PainterCard painterId={painterId} />
      <h2 className="">
        They will reach out within two business days to
        schedule your job. If you have any questions, please
        contact us at:
      </h2>
      <a
        href="mailto:dwelldonehelp@gmail.com?subject=Contact%20DwellDone"
        className="text-center text-sm"
      >
        dwelldonehelp@gmail.com
      </a>
      <h2 className=""> or </h2>
      <a
        href="tel:+16158096429"
        className="text-center text-sm mt-2"
      >
        (615) 809-6429
      </a>
    </div>
  );
};
