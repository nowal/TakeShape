import { FC } from 'react';
import { ButtonsCvaButton } from '@/components/cva/button';
import { FallbacksLoading } from '@/components/fallbacks/loading';
import { useAuth } from '@/context/auth/provider';

export const SignInButton: FC = () => {
  const { signIn, isUserSignedIn } = useAuth();
  const { isAuthLoading, onModalOpen } = signIn;

  if (isAuthLoading) {
    return <FallbacksLoading />; // Or any other loading indicator
  }
  const title = isUserSignedIn ? 'Sign Out' : 'Login';

  return (
    <ButtonsCvaButton
      onTap={onModalOpen}
      title={title}
      intent="ghost"
      layout={false}
      size="sm"
    >
      {title}
    </ButtonsCvaButton>
  );
};
