import {
  useApiLoadingStatus,
  APILoadingStatus,
} from '@vis.gl/react-google-maps';
export type TLoadedStatus = typeof APILoadingStatus;

export const useMapsLoadedCheck = () => {
  const loadingStatus = useApiLoadingStatus();
  return loadingStatus === APILoadingStatus.LOADED;
};
