import { FC } from 'react';
import { useAccountSettings } from '@/context/account-settings/provider';
import { TInputProps } from '@/types/dom/element';
import { InputsText } from '@/components/inputs/text';
import { AddressAutocomplete } from '@/components/painter/address/autocomplete';

type TProps = TInputProps;
export const InputsAddress: FC<TProps> = (props) => {
  const {
    address,
    addressFormatted,
    dispatchAddressFormatted,
    dispatchAddress,
  } = useAccountSettings();
  const addressValue = addressFormatted ?? address;

  return (
    <div>
      <AddressAutocomplete>
        {(ref) => {
          return (
            <InputsText
              placeholder="Address"
              ref={ref}
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
          );
        }}
      </AddressAutocomplete>
    </div>
  );
};
