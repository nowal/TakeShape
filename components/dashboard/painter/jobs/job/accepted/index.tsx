import type { FC } from 'react';
import { TJob } from '@/types/jobs';
import { TypographyFormTitle } from '@/components/typography/form/title';
import { DashboardPainterJobAcceptedContact } from '@/components/dashboard/painter/jobs/job/accepted/contact';
import { DashboardPreferences } from '@/components/dashboard/preferences';
import { DashboardPainterJobInvoice } from '@/components/dashboard/painter/jobs/job/invoice';

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
      <DashboardPreferences {...job} />
    </>
  );
};
