import { FC } from 'react';
import { useAccountSettings } from '@/context/account-settings/provider';
import { TInputProps } from '@/types/dom/element';
import { InputsText } from '@/components/inputs/text';
import { useAddressAutocomplete } from '@/components/account-settings/user/inputs/address/autocomplete';

type TProps = TInputProps;
export const InputsAddress: FC<TProps> = (props) => {
  const {
    isPainter,
    address,
    addressFormatted,
    dispatchAddressFormatted,
    dispatchAddress,
    addressInputRef,
  } = useAccountSettings();

  useAddressAutocomplete();

  const addressValue = addressFormatted ?? address;

  return (
    <div>
      <InputsText
        placeholder="Address"
        ref={addressInputRef}
        value={addressValue}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
          }
        }}
        onChange={async (event) => {
          dispatchAddressFormatted(null);
          const nextAddressValue = event.target.value;
          dispatchAddress(nextAddressValue);
        }}
        required
        {...props}
      />
    </div>
  );
};
