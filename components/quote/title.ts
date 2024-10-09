import { useQuote } from '@/context/quote/provider';
import { formatUploading } from '@/utils/format/uploading';

export const useQuoteTitle = () => {
  const {
    isUploading: isInitUploading,
    progress,
    uploadStatus,
  } = useQuote();
  const isUploading = uploadStatus === 'uploading';
  const isCompleted = uploadStatus === 'completed';
  const isError = uploadStatus === 'error';

  if (isError) return 'Upload Failed';
  if (isCompleted) return 'Done';
  if (isInitUploading) {
    if (isUploading) return formatUploading(progress);
    return 'Uploading...';
  }
  return 'Upload your video';
};
