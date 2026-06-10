import { TAccountMenuListItem } from '@/components/buttons/account-menu/list';
import { useAuth } from '@/context/auth/provider';
import { useRouter } from 'next/navigation';

export const useSignInButton = (): TAccountMenuListItem => {
  const { isUserSignedIn, onSignOut } = useAuth();
  const router = useRouter();

  const handleSignOut = () => {
    console.log('SIGNING OUT');
    onSignOut();
  };

  const handleLogin = () => {
    router.push('/login');
  };

  return isUserSignedIn
    ? ['Sign Out', handleSignOut]
    : ['Login', handleLogin];
};
