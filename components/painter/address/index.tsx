import { InputsAddress } from '@/components/account-settings/user/inputs/address';
import { PainterAddressMap } from '@/components/painter/address/map';
import { PainterRange } from '@/components/painter/address/range';
import { useAccountSettings } from '@/context/account-settings/provider';
import { useApiLoadingStatus } from '@vis.gl/react-google-maps';

export const PainterAddress = () => {
  const {
    address,
    addressFormatted,
    coords,
    prevCoordsRef,
  } = useAccountSettings();
  const loadingStatus = useApiLoadingStatus();

  const addressValue = addressFormatted ?? address;

  const isReady =
    Boolean(addressValue) &&
    coords !== null &&
    loadingStatus === 'LOADED';
  console.log(prevCoordsRef);

  return (
    <>
      <InputsAddress />
      <PainterRange isReady={isReady} />
      <PainterAddressMap isReady={isReady} />
    </>
  );
};
