import { FC, useRef } from 'react';
import {
  TAddressAutocompleteRef,
  useAddressAutocomplete,
} from '@/hooks/address/autocomplete';

type TProps = {
  children(
    addressInputRef: TAddressAutocompleteRef
  ): JSX.Element;
};
export const AddressAutocomplete: FC<TProps> = ({
  children,
}) => {
  const addressInputRef = useRef<HTMLInputElement | null>(
    null
  );
  useAddressAutocomplete(addressInputRef);

  return <>{children(addressInputRef)}</>;
};
