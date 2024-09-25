import type { FC } from 'react';
import { useAccountSettings } from '@/context/account-settings/provider';
import { InputsText } from '@/components/inputs/text';

export const ComponentsAccountSettingsUserInputsPhoneNumber: FC =
  () => {
    const { phoneNumber, dispatchPhoneNumber } =
      useAccountSettings();

    return (
      <div>
        <InputsText
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={(event) =>
            dispatchPhoneNumber(event.target.value)
          }
          required
        />
        {/* <label
          htmlFor="phoneNumber"
          className="block text-md font-medium text-gray-700"
        >
          Phone Number
        </label>
        <input
          type="tel"
          id="phoneNumber"
          value={phoneNumber}
          onChange={(event) =>
            dispatchPhoneNumber(event.target.value)
          }
          placeholder="Enter your phone number"
          required
          className="p-2 border rounded w-full"
        /> */}
      </div>
    );
  };
