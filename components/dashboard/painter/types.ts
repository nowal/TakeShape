import { JOB_TYPES } from '@/components/dashboard/painter/constants';

export type TJobType = keyof typeof JOB_TYPES;

export type TJobTypeProps = { typeKey: TJobType };

export type TJobTypeDisplay = `${TJobType} ${number}`;
