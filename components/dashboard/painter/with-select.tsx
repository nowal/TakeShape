import { InputsSelect } from '@/components/inputs/select';
import { JOB_TYPE_TO_PAGE_ROUTE } from '@/components/dashboard/painter/constants';
import { TPropsWithChildren } from '@/types/dom/main';
import { FC } from 'react';
import { isQuoteType } from '@/components/dashboard/painter/validation';
import { DashboardHeader } from '@/components/dashboard/header';
import { useDashboardPainter } from '@/context/dashboard/painter/provider';
import { FallbacksLoadingCircleCenter } from '@/components/fallbacks/loading/circle/center';
import {
  TJobType,
  TJobTypeProps,
} from '@/components/dashboard/painter/types';
import { resolveObjectKeys } from '@/utils/object';
import { TSelectIdNameItem } from '@/types';
import { capitalize } from '@/utils/css/format';

type TProps = TPropsWithChildren & TJobTypeProps;
export const DashboardPainterWithSelect: FC<TProps> = ({
  children,
  typeKey,
}) => {
  const dashboardPainter = useDashboardPainter();
  const { isNavigating, onPageChange } = dashboardPainter;

  const mapJobTypeCount = (jobTypeKey: TJobType) =>
    dashboardPainter[jobTypeKey].jobs.length;

  const idValues: TSelectIdNameItem[] = resolveObjectKeys(
    JOB_TYPE_TO_PAGE_ROUTE
  ).map((id) => ({
    id,
    name: capitalize(id),
    count: mapJobTypeCount(id),
  }));

  return (
    <div className="flex flex-col items-center px-4 md:px-8">
      <DashboardHeader>
        <InputsSelect
          name="painter-quote"
          idValues={idValues}
          placeholder="Select Quote"
          value={typeKey}
          onValueChange={(_, value) => {
            if (isQuoteType(value)) {
              onPageChange(value);
            }
          }}
        />
      </DashboardHeader>
      <div className="h-8" />
      {isNavigating ? (
        <FallbacksLoadingCircleCenter />
      ) : (
        <div>{children}</div>
      )}
    </div>
  );
};
