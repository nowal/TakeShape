import { ComponentsAccountSettingsUserInputsAddress } from '@/components/account-settings/user/inputs/address';
import { ComponentsAccountSettingsUserInputsName } from '@/components/account-settings/user/inputs/name';
import { NotificationsInlineHighlight } from '@/components/notifications/inline/highlight';
import { useAccountSettings } from '@/context/account-settings/provider';
import type { FC } from 'react';

export const ComponentsAccountSettingsHomeowner: FC =
  () => {
    const { agentError } = useAccountSettings();

    return (
      <>
        <ComponentsAccountSettingsUserInputsName />
        <ComponentsAccountSettingsUserInputsAddress />
        <div>
          {agentError && (
            <>
              <div className="h-1" />
              <NotificationsInlineHighlight>
                {agentError}
              </NotificationsInlineHighlight>
            </>
          )}
        </div>
      </>
    );
  };
