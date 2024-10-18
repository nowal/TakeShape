import {
  TJobType,
  TJobTypeDisplay,
} from '@/components/dashboard/painter/types';

export const mapJobTypeDisplay = (
  jobTypeKey: TJobType,
  mapJobTypeCount: (jobTypeKey: TJobType) => number
): TJobTypeDisplay =>
  `${jobTypeKey} ${mapJobTypeCount(jobTypeKey)}` as const;
