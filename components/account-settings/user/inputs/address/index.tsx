import { FC } from 'react';
import { useAccountSettings } from '@/context/account-settings/provider';
import { TInputProps } from '@/types/dom/element';
import { InputsText } from '@/components/inputs/text';
import { useAddressAutocomplete } from '@/components/account-settings/user/inputs/address/autocomplete';

type TProps = TInputProps;
export const InputsAddress: FC<TProps> = (props) => {
  const { address, dispatchAddress, addressInputRef } =
    useAccountSettings();

  useAddressAutocomplete();

  return (
    <div>
      <InputsText
        placeholder="Address"
        ref={addressInputRef}
        value={address}
        onChange={(event) =>
          dispatchAddress(event.target.value)
        }
        required
        {...props}
      />
    </div>
  );
};
