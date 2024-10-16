'use client';
import { GoogleAnalytics } from '@next/third-parties/google';
import { ComponentsAccountSettingsNotifications } from '@/components/account-settings/notifications';
import { ComponentsAccountSettingsUser } from '@/components/account-settings/user';
import { useAccountSettings } from '@/context/account-settings/provider';
import { useAuth } from '@/context/auth/provider';
import { useAuthNavigateHome } from '@/hooks/auth/navigate/home';
import { ButtonsCvaButton } from '@/components/cva/button';
import { IconsLoading16White } from '@/components/icons/loading/16/white';
import { IconsError16White } from '@/components/icons/error/16/white';

const AccountSettingsPage = () => {
  const { isAuthLoading } = useAuth();
  const accountSettings = useAccountSettings();
  const {
    isAccountSettingsSubmitting,
    isPainter,
    isAgent,
    errorMessage,
    addressFormatted,
    onUpdate,
    onSubmit,
  } = accountSettings;

  useAuthNavigateHome();

  if (isAuthLoading) return null;

  const submitTitle = isAccountSettingsSubmitting
    ? 'Updating'
    : 'Update';

  const isError = Boolean(errorMessage);

  return (
    <div className="relative flex flex-col gap-5 items-center">
      <GoogleAnalytics gaId="G-47EYLN83WE" />
      <h2 className="typography-page-title">
        Your Profile
      </h2>
      <div className="relative flex flex-col gap-5 items-center w-[320px] sm:w-[382px]">
        <div className="fill-column-white-sm gap-4">
          {isError && (
            <ComponentsAccountSettingsNotifications>
              {errorMessage}
            </ComponentsAccountSettingsNotifications>
          )}
          <form
            {...(isPainter ? {} : { onSubmit })}
            className="flex flex-col gap-4"
          >
            <ComponentsAccountSettingsUser
              isPainter={isPainter}
              isAgent={isAgent}
            />
            <ButtonsCvaButton
              title={submitTitle}
              icon={{
                Leading: isAccountSettingsSubmitting
                  ? IconsLoading16White
                  : isError
                  ? IconsError16White
                  : null,
              }}
              type="submit"
              isDisabled={isAccountSettingsSubmitting}
              intent="primary"
              size="sm"
              gap="xl"
              center
              {...(isPainter
                ? addressFormatted
                  ? { onTap: onUpdate }
                  : { isDisabled: true }
                : {})}
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
