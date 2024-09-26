import { useViewport } from '@/context/viewport';

export const useObjectPosition = () => {
  const viewport = useViewport();

  if (viewport.isDimensions && viewport.isSm)
    return '80% 50%';
  if (viewport.isDimensions && viewport.isLg)
    return '85% 50%';

  return '90% 50%';
};
