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
      </div>
    );
  };
