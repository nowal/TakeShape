import type { FC } from 'react';
import { useAccountSettings } from '@/context/account-settings/provider';
import { InputsText } from '@/components/inputs/text';

export const ComponentsAccountSettingsUserInputsName: FC =
  () => {
    const { name, dispatchName } = useAccountSettings();

    return (
      <div>
        <InputsText
          placeholder="Name"
          value={name}
          onChange={(event) =>
            dispatchName(event.target.value)
          }
          required
        />
        {/* <label
          htmlFor="name"
          className="block text-md font-medium text-gray-700"
        >
          Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(event) =>
            dispatchName(event.target.value)
          }
          placeholder="Enter your name"
          required
          className="p-2 border rounded w-full"
        /> */}
      </div>
    );
  };
