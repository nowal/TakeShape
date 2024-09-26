import type { FC } from 'react';
import { TJob } from '@/types';
import { TPropsWithChildren } from '@/types/dom/main';

type TProps = TPropsWithChildren<{ job: TJob }>;
export const DashboardPainterJob: FC<TProps> = ({
  job,
  children,
}) => {
  console.log('job ', job)
  return (
    <div
      key={job.jobId}
      className="flex flex-col md:flex-row justify-center items-start mb-10 w-full max-w-4xl"
    >
      <div className="flex flex-col justify-center items-center lg:mr-8 mb-4 lg:mb-0 w-full lg:w-auto">
        <video
          src={`${job.video}#t=0.001`}
          autoPlay
          controls
          playsInline
          muted={true}
          className="w-full lg:w-96"
        />
        {children}
      </div>
    </div>
  );
};
