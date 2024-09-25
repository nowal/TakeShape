import type { FC } from 'react';
import { useAccountSettings } from '@/context/account-settings/provider';

export const ComponentsAccountSettingsUserInputsName: FC =
  () => {
    const { name, dispatchName } = useAccountSettings();
    return (
      <div>
        <label
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
        />
      </div>
    );
  };
