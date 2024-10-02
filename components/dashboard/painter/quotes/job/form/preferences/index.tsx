import type { FC } from 'react';
import { TJob } from '@/types';
import { TypographyFormTitle } from '@/components/typography/form/title';
import { DashboardPainterJobFormPreferencesList } from '@/components/dashboard/painter/quotes/job/form/preferences/list';
import { TypographyFormSubtitle } from '@/components/typography/form/subtitle';

type TProps = TJob;
export const DashboardPainterJobFormPreferences: FC<
  TProps
> = (job) => {
  return (
    <div className="details-box space-y-2 w-full lg:w-auto">
      <div className="space-y-1">
        <TypographyFormTitle>
          Paint Preferences:
        </TypographyFormTitle>
        <DashboardPainterJobFormPreferencesList
          {...job}
        />
      </div>
      <div>
        <TypographyFormSubtitle>
          Special Requests
        </TypographyFormSubtitle>
        <p className="font-semibold">
          {job.specialRequests || 'N/A'}
        </p>
      </div>
    </div>
  );
};
