'use client';
import { GoogleAnalytics } from '@next/third-parties/google';
import { ComponentsAccountSettingsNotifications } from '@/components/account-settings/notifications';
import { ComponentsAccountSettingsUser } from '@/components/account-settings/user';
import { useAccountSettings } from '@/context/account-settings/provider';

const AccountSettingsPage = () => {
  const accountSettings = useAccountSettings();
  const {
    isLoading,
    isPainter,
    isAgent,
    errorMessage,
    onSubmit,
  } = accountSettings;
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
            className="flex flex-col space-y-4"
          >
            <ComponentsAccountSettingsUser
              isPainter={isPainter}
              isAgent={isAgent}
            />
            <button
              type="submit"
              className={`button-green ${
                isLoading
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
            >
              {isLoading ? 'Updating...' : 'Update'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default AccountSettingsPage;
