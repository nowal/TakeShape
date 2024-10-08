import { TAccountMenuListItem } from '@/components/buttons/account-menu/list';
import { useAuth } from '@/context/auth/provider';

export const useSignInButton = (): TAccountMenuListItem => {
  const { isUserSignedIn, menu, signIn } = useAuth();

  const handleSignOut = () => {
    console.log('SIGNING OUT');
    menu.onSignOut();
  };
  return isUserSignedIn
    ? ['Sign Out', handleSignOut]
    : ['Login', signIn.onSignInButtonClick];
};
