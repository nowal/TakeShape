import type { FC } from 'react';
import { TJob } from '@/types';
import { DashboardPainterJobFormPrice } from '@/components/dashboard/painter/quotes/job/form/price';
import { DashboardPainterJobFormCompletedInvoice } from '@/components/dashboard/painter/quotes/job/form/completed/invoice';
import { TypographyFormTitle } from '@/components/typography/form/title';
import { DashboardPainterJobFormAcceptedContact } from '@/components/dashboard/painter/quotes/job/form/accepted/contact';
import { DashboardPainterJobFormPreferences } from '@/components/dashboard/painter/quotes/job/form/preferences';

type TProps = TJob;
export const DashboardPainterJobFormAccepted: FC<TProps> = (
  job
) => {
  return (
    <div>
      <div>
        <DashboardPainterJobFormPrice {...job} />
        <DashboardPainterJobFormCompletedInvoice {...job} />
        <TypographyFormTitle>
          Customer Details:
        </TypographyFormTitle>
        <DashboardPainterJobFormAcceptedContact {...job} />
      </div>
      <DashboardPainterJobFormPreferences {...job} />
    </div>
  );
};
