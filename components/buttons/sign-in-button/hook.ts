import { TAccountMenuListItem } from '@/components/buttons/account-menu/list';
import { useAuth } from '@/context/auth/provider';
import { useRouter } from 'next/navigation';

export const useSignInButton = (): TAccountMenuListItem => {
  const { isUserSignedIn, menu, signIn } = useAuth();

  const router = useRouter();
  const handleSignOut = () => {
    console.log('SIGNING OUT');
    menu.onSignOut();
    router.push('/');
  };
  return isUserSignedIn
    ? ['Sign Out', handleSignOut]
    : ['Login', signIn.onSignInButtonClick];
};
