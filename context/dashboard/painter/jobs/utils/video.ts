import { TJob } from '@/types/jobs';
import { resolveVideoUrl } from '@/utils/video/url';

export const transformVideo = async (
  job: TJob
): Promise<TJob> => {
  const video = await resolveVideoUrl(job.video);
  return { ...job, video };
};
