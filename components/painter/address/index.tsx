import { InputsAddress } from '@/components/account-settings/user/inputs/address';
import { MapsLoaded } from '@/components/maps/loaded/loaded';
import { PainterAddressMap } from '@/components/painter/address/map';
import { PainterRange } from '@/components/painter/address/range';
import { useAccountSettings } from '@/context/account-settings/provider';

export const PainterAddress = () => {
  const { address, addressFormatted, coords } =
    useAccountSettings();
  const addressValue = addressFormatted ?? address;
  const isReady = Boolean(addressValue) && coords !== null;

  return (
    <MapsLoaded>
      <InputsAddress />
      <PainterRange isReady={isReady} />
      <PainterAddressMap isReady={isReady} />
    </MapsLoaded>
  );
};
