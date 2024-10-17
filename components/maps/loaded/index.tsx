import { TProviderFc } from '@/context/type';
import { useMapsLoadedCheck } from '@/hooks/maps/loaded';

export const MapsLoaded: TProviderFc = ({ children }) => {
  const isLoaded = useMapsLoadedCheck();
  if (!isLoaded) return null;
  return <>{children}</>;
};
