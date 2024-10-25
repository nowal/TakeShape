import type { FC } from 'react';
import { useDashboardPainter } from '@/context/dashboard/painter/provider';
import { TJobTypeProps } from '@/components/dashboard/painter/types';
import { CvaButton } from '@/components/cva/button';
import { TypographyDetailsSubtitle } from '@/components/typography/details/subtitle';
import { TypographyDetailsPink } from '@/components/typography/details/pink';
import { TypographyFormSubtitle } from '@/components/typography/form/subtitle';

type TProps = TJobTypeProps;
export const DashboardPainterJobsShowMore: FC<TProps> = ({
  ...jobTypeProps
}) => {
  const title = 'Show more';
  const dashboardPainter = useDashboardPainter();
  const currCount =
    dashboardPainter[jobTypeProps.typeKey].jobs.length;
  const state = dashboardPainter[jobTypeProps.typeKey];
  if (currCount <= state.count) return null;

  const handleShowMoreClick = () => {
    state.dispatchCount((prev) => prev + 10);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 pt-4">
      <TypographyDetailsSubtitle>
        Showing {Math.min(state.count, currCount)} of {currCount}
      </TypographyDetailsSubtitle>
      <CvaButton
        title={title}
        onTap={handleShowMoreClick}
        intent="ghost-1"
        size="sm"
        center
      >
        <span className="font-medium">{title}</span>
      </CvaButton>
    </div>
  );
};
