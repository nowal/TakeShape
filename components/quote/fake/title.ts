import { useQuoteFakeHandler } from '@/components/quote/fake/handler';
import { useQuote } from '@/context/quote/provider';

export const useQuoteTitleFake = ({
  isCompleted,
  isInit,
}: Omit<ReturnType<typeof useQuoteFakeHandler>, 'onInit'>) => {
  const { uploadStatus } = useQuote();
  const isError = uploadStatus === 'error';
  if (isError) return 'Upload Failed';
  if (isCompleted) return 'Done';
  if (isInit) return 'Uploading...';
  return 'Upload your video *';
};
