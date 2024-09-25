import type { FC } from 'react';
import { useAccountSettings } from '@/context/account-settings/provider';
import { TInputProps } from '@/types/dom/element';
import { InputsText } from '@/components/inputs/text';

type TProps = TInputProps;
export const ComponentsAccountSettingsUserInputsAddress: FC<
  TProps
> = ({ ...props }) => {
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
      />
      {/* <label
          htmlFor="address"
          className="block text-md font-medium text-gray-700"
        >
          Address
        </label> */}
      {/* <input
          type="text"
          id="address"
          ref={addressInputRef}
          value={address}
          onChange={(event) =>
            dispatchAddress(event.target.value)
          }
          placeholder="Enter your address"
          required
          className="p-2 border rounded w-full"
          {...props}
        /> */}
    </div>
  );
};
