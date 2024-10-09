import { useQuote } from '@/context/quote/provider';
import { formatUploading } from '@/utils/format/uploading';

type TConfig = any;
export const useQuoteTitle = (config?: TConfig) => {
  const {
    isUploading: isInitUploading,
    progress,
    uploadStatus,
    title: _title,
  } = useQuote();
  const isUploading = uploadStatus === 'uploading';
  const isCompleted = uploadStatus === 'completed';
  const isError = uploadStatus === 'error';

  if (isError) return 'Upload Failed'
  if (isCompleted) return 'Done';
  if (isInitUploading) {
    if (isUploading) return formatUploading(progress);
    return 'Uploading...';
  }
  return 'Upload your video';
};
