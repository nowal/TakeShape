import type { FC } from 'react';
import { TJob } from '@/types';
import { TypographyFormTitle } from '@/components/typography/form/title';
import { DashboardPainterJobAcceptedContact } from '@/components/dashboard/painter/quotes/job/accepted/contact';
import { DashboardPainterJobPreferences } from '@/components/dashboard/preferences';
import { DashboardPainterJobInvoice } from '@/components/dashboard/painter/quotes/job/invoice';

type TProps = TJob;
export const DashboardPainterJobAccepted: FC<TProps> = (
  job
) => {
  return (
    <>
      <div>
        <DashboardPainterJobInvoice {...job} />
        <TypographyFormTitle>
          Customer Details:
        </TypographyFormTitle>
        <DashboardPainterJobAcceptedContact {...job} />
      </div>
      <DashboardPainterJobPreferences {...job} />
    </>
  );
};
