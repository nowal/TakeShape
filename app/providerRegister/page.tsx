'use client';
import { usePainterRegister } from '@/context/painter/register/provider';
import { ComponentsAccountSettingsNotifications } from '@/components/account-settings/notifications';
import { ComponentsPainterRegister } from '@/components/painter/register';
import { ComponentsRegisterShell } from '@/components/register/shell';

const ProviderRegisterPage = () => {
  const painterRegister = usePainterRegister();
  const { errorMessage } = painterRegister;

  return (
    <ComponentsRegisterShell title="Provider Registration">
      <>
        {errorMessage && (
          <ComponentsAccountSettingsNotifications>
            {errorMessage}
          </ComponentsAccountSettingsNotifications>
        )}
        <ComponentsPainterRegister />
      </>
    </ComponentsRegisterShell>
  );
};

export default ProviderRegisterPage;
