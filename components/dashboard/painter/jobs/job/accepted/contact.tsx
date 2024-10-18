import type { FC } from 'react';
import { TJob } from '@/types';
import { TypographyFormSubtitle } from '@/components/typography/form/subtitle';

type TProps = TJob;
export const DashboardPainterJobAcceptedContact: FC<
  TProps
> = (job) => {
  return (
    <ul>
      {(
        [
          ['Name', job.customerName || 'N/A'],
          ['Phone Number', job.phoneNumber || 'N/A'],
          ['Address', job.address || 'N/A'],
        ] as const
      ).map(([title, value]) => (
        <li className="flex flex-row gap-1" key={title}>
          <TypographyFormSubtitle>
            {title}
          </TypographyFormSubtitle>
          <span className="font-semibold">{value}</span>
        </li>
      ))}
    </ul>
  );
};
