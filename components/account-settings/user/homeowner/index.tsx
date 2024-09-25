import { ComponentsAccountSettingsUserInputsAddress } from '@/components/account-settings/user/inputs/address';
import { ComponentsAccountSettingsUserInputsName } from '@/components/account-settings/user/inputs/name';
import { useAccountSettings } from '@/context/account-settings/provider';
import type { FC } from 'react';

export const ComponentsAccountSettingsHomeowner: FC =
  () => {
    const {
      agentError,
      agentName,
      newAgentName,
      dispatchNewAgentName,
    } = useAccountSettings();

    return (
      <>
        <ComponentsAccountSettingsUserInputsName />
        <ComponentsAccountSettingsUserInputsAddress />
        <div>
          <label
            htmlFor="realEstateAgent"
            className="block text-md font-medium text-gray-700"
          >
            Real Estate Agent (optional)
          </label>
          <input
            type="text"
            id="realEstateAgent"
            value={agentName ? agentName : newAgentName}
            onChange={(event) =>
              dispatchNewAgentName(event.target.value)
            }
            placeholder="Enter agent's name"
            className="p-2 border rounded w-full"
          />
          {agentError && (
            <p className="text-red-600">{agentError}</p>
          )}
        </div>
      </>
    );
  };
