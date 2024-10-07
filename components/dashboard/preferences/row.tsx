import { DashboardPainterJobPanel } from '@/components/dashboard/painter/quotes/job/panel';
import { TypographyDetailsSubtitle } from '@/components/typography/details/subtitle';
import { TypographyDetailsTitle } from '@/components/typography/details/title';
import type { FC } from 'react';

type TProps = {
  title: string;
  items: [string, string][];
};
export const DashboardPainterJobPreferencesRow: FC<
  TProps
> = ({ title, items }) => {
  return (
    <DashboardPainterJobPanel classValue="flex flex-col">
      <TypographyDetailsTitle>
        {title}
      </TypographyDetailsTitle>
      <div className="flex flex-row gap-4">
        {items.map(([title, value]) => (
          <div key={title} className="flex flex-row gap-1">
            <TypographyDetailsSubtitle>
              {title}
            </TypographyDetailsSubtitle>
            <TypographyDetailsTitle classValue="text-pink">
              {value}
            </TypographyDetailsTitle>
          </div>
        ))}
      </div>
    </DashboardPainterJobPanel>
  );
};
