import { InputsAddress } from '@/components/account-settings/user/inputs/address';
import { PainterAddressMap } from '@/components/painter/address/map';
import { PainterRange } from '@/components/painter/address/range';
import { useAccountSettings } from '@/context/account-settings/provider';
import { useApiLoadingStatus } from '@vis.gl/react-google-maps';

export const PainterAddress = () => {
  const { address, coords, dispatchCoords } =
    useAccountSettings();

  const loadingStatus = useApiLoadingStatus();

  const isReady =
    Boolean(address) &&
    coords !== null &&
    loadingStatus === 'LOADED';

  return (
    <>
      <InputsAddress />
      <PainterRange isReady={isReady} />
      <PainterAddressMap isReady={isReady} />
    </>
  );
};
