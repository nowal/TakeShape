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
          />
     
          {agentError && (
            <>
            <div className='h-1'/>
              <NotificationsHighlight>
                {agentError}
              </NotificationsHighlight>
            </>
          )}
        </div>
      </>
    );
  };
