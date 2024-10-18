import { InputsSelect } from '@/components/inputs/select';
import { JOB_TYPES } from '@/components/dashboard/painter/constants';
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
import { mapJobTypeDisplay } from '@/utils/css/job-type';
import { resolveObjectKeys } from '@/utils/object';
import { TDisplayResolver } from '@/components/inputs/select/list/id-title';
import { TSelectIdNameItem } from '@/types';
import { capitalize } from '@/utils/css/format';

type TProps = TPropsWithChildren & TJobTypeProps;
export const DashboardPainterWithSelect: FC<TProps> = ({
  children,
}) => {
  const dashboardPainter = useDashboardPainter();
  const { isNavigating, selectedPage, onPageChange } =
    dashboardPainter;

  const mapJobTypeCount = (jobTypeKey: TJobType) =>
    dashboardPainter[jobTypeKey].jobs.length;

  const idValues: TSelectIdNameItem[] = resolveObjectKeys(
    JOB_TYPES
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
          value={selectedPage}
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
