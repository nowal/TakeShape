import { ComponentsAccountSettingsUserInputsAddress } from '@/components/account-settings/user/inputs/address';
import { ComponentsAccountSettingsUserInputsName } from '@/components/account-settings/user/inputs/name';
import { InputsText } from '@/components/inputs/text';
import { NotificationsHighlight } from '@/components/notifications/highlight';
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
          <InputsText
            placeholder="Real Estate Agent (optional)"
            value={agentName ? agentName : newAgentName}
            onChange={(event) =>
              dispatchNewAgentName(event.target.value)
            }
            required
          />
          {/* <label
            htmlFor="realEstateAgent"
            className="block text-md font-medium text-gray-700"
          >
            Real Estate Agent (optional)
          </label> */}
          {/* <input
            type="text"
            id="realEstateAgent"
            value={agentName ? agentName : newAgentName}
            onChange={(event) =>
              dispatchNewAgentName(event.target.value)
            }
            placeholder="Enter agent's name"
            className="p-2 border rounded w-full"
          /> */}
          {agentError && (
            <NotificationsHighlight>
              <p className="text-red-600">{agentError}</p>
            </NotificationsHighlight>
          )}
        </div>
      </>
    );
  };
