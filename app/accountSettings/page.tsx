'use client';
import { GoogleAnalytics } from '@next/third-parties/google';
import { ComponentsAccountSettingsNotifications } from '@/components/account-settings/notifications';
import { ComponentsAccountSettingsUser } from '@/components/account-settings/user';
import { useAccountSettings } from '@/context/account-settings/provider';
import { useAuth } from '@/context/auth/provider';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AccountSettingsPage = () => {
  const { isUserSignedIn, signIn } = useAuth();
  const { isAuthLoading } = signIn;
  const accountSettings = useAccountSettings();
  const router = useRouter();

  const {
    isLoading,
    isPainter,
    isAgent,
    errorMessage,
    onSubmit,
  } = accountSettings;

  useEffect(() => {
    if (!isAuthLoading && !isUserSignedIn) {
      router.push('/');
    }
  }, [isUserSignedIn, isAuthLoading]);

  if (isAuthLoading) return null;

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
