import { ComponentsAccountSettingsUserInputsAddress } from '@/components/account-settings/user/inputs/address';
import { PainterAddressMap } from '@/components/painter/address/map';
import { PainterRange } from '@/components/painter/address/range';

export const PainterAddress = () => {
  return (
    <>
      <ComponentsAccountSettingsUserInputsAddress />
      <PainterRange />
      <PainterAddressMap />
    </>
  );
};
