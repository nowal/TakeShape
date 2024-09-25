import { ComponentsAccountSettingsAgent } from '@/components/account-settings/user/agent';
import { ComponentsAccountSettingsHomeowner } from '@/components/account-settings/user/homeowner';
import { ComponentsAccountSettingsPainter } from '@/components/account-settings/user/painter';
import { FallbacksLoading } from '@/components/fallbacks/loading';
import { useAccountSettings } from '@/context/account-settings/provider';
import type { FC } from 'react';

type TProps = { isPainter: boolean; isAgent: boolean };
export const ComponentsAccountSettingsUser: FC<TProps> = ({
  isAgent,
  isPainter,
}) => {
  const accountSettings = useAccountSettings();
  const { isDataLoading } = accountSettings;

  if (isDataLoading) {
    return <FallbacksLoading />;
  }

  if (isPainter) {
    return <ComponentsAccountSettingsPainter />;
  }
  if (isAgent) {
    return <ComponentsAccountSettingsAgent />;
  }
  return <ComponentsAccountSettingsHomeowner />;
};
