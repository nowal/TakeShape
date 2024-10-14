'use client';
import { GoogleAnalytics } from '@next/third-parties/google';
import { ComponentsAccountSettingsNotifications } from '@/components/account-settings/notifications';
import { ComponentsAccountSettingsUser } from '@/components/account-settings/user';
import { useAccountSettings } from '@/context/account-settings/provider';
import { useAuth } from '@/context/auth/provider';
import { useAuthNavigateHome } from '@/hooks/auth/navigate/home';
import { ButtonsCvaButton } from '@/components/cva/button';
import { IconsLoading16 } from '@/components/icons/loading/16';
import { useEffect } from 'react';

const AccountSettingsPage = () => {
  const { isAuthLoading } = useAuth();
  const accountSettings = useAccountSettings();
  const {
    isAddressLoading,
    isLoading,
    isPainter,
    isAgent,
    errorMessage,
    coords,
    range,
    onSubmit,
    onUpdateMap,
  } = accountSettings;
  useAuthNavigateHome();
  
  useEffect(() => {
    console.log(
      'ACC    SETTINGS ',
      coords,
      ' ',
      range,

      '   isAddressLoading ',
      isAddressLoading
    );
    if (coords && !isAddressLoading) {
      onUpdateMap(coords, range);
    }
  }, [isAddressLoading, coords, range]);

  if (isAuthLoading) return null;

  const submitTitle = isLoading ? 'Updating' : 'Update';

  return (
    <div className="relative flex flex-col gap-5 items-center">
      <GoogleAnalytics gaId="G-47EYLN83WE" />
      <h2 className="typography-page-title">
        Your Profile
      </h2>
      <div className="relative flex flex-col gap-5 items-center w-[320px] sm:w-[382px]">
        <div className="fill-column-white-sm">
          {errorMessage && (
            <ComponentsAccountSettingsNotifications>
              {errorMessage}
            </ComponentsAccountSettingsNotifications>
          )}
          <form
            onSubmit={onSubmit}
            className="flex flex-col gap-4"
          >
            <ComponentsAccountSettingsUser
              isPainter={isPainter}
              isAgent={isAgent}
            />
            <ButtonsCvaButton
              title={submitTitle}
              icon={
                isLoading ? { Leading: IconsLoading16 } : {}
              }
              type="submit"
              isDisabled={isLoading}
              intent="primary"
              size="sm"
              gap="xl"
              center
            >
              {submitTitle}
            </ButtonsCvaButton>
          </form>
        </div>
      </div>
    </div>
  );
};
export default AccountSettingsPage;
