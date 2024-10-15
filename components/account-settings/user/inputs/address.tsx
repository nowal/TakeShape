import { FC } from 'react';
import { useAccountSettings } from '@/context/account-settings/provider';
import { TInputProps } from '@/types/dom/element';
import { InputsText } from '@/components/inputs/text';

type TProps = TInputProps;
export const ComponentsAccountSettingsUserInputsAddress: FC<
  TProps
> = (props) => {
  const { address, dispatchAddress, addressInputRef } =
    useAccountSettings();

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
