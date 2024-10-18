import { JOB_TYPE_TO_PAGE_ROUTE } from '@/components/dashboard/painter/constants';

export type TJobType = keyof typeof JOB_TYPE_TO_PAGE_ROUTE;

export type TJobTypeProps = { typeKey: TJobType };
