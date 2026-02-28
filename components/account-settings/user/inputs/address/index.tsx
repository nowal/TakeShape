import { FC, useEffect } from 'react';
import { useAccountSettings } from '@/context/account-settings/provider';
import { TInputProps } from '@/types/dom/element';
import { InputsText } from '@/components/inputs/text';
import { AddressAutocomplete } from '@/components/painter/address/autocomplete';
import {
  parseCoordsFromAddress,
  resolveAddressFromCoords,
} from '@/hooks/address/geocode';

type TProps = TInputProps;
export const InputsAddress: FC<TProps> = (props) => {
  const {
    address,
    addressFormatted,
    dispatchAddressFormatted,
    dispatchAddress,
  } = useAccountSettings();
  const addressValue = addressFormatted ?? address;

  useEffect(() => { 
    if(addressFormatted != null) {
      dispatchAddress(addressFormatted);
    }
  }, [addressFormatted]);

  useEffect(() => {
    if (addressFormatted !== null) return;
    const coords = parseCoordsFromAddress(address);
    if (!coords) return;

    let isMounted = true;
    resolveAddressFromCoords(coords).then(
      (resolvedAddress) => {
        if (!isMounted || !resolvedAddress) return;
        dispatchAddressFormatted(resolvedAddress);
        dispatchAddress(resolvedAddress);
      }
    );

    return () => {
      isMounted = false;
    };
  }, [address, addressFormatted]);

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
