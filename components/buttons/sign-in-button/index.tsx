import { FC } from 'react';
import { ButtonsCvaButton } from '@/components/cva/button';
import { useAuth } from '@/context/auth/provider';
import { useSignInButton } from '@/components/buttons/sign-in-button/hook';
import { FallbacksLoadingCircle } from '@/components/fallbacks/loading/circle';

export const SignInButton: FC = () => {
  const { isAuthLoading } = useAuth();
  const [title, handler] = useSignInButton();

  if (isAuthLoading) {
    return <FallbacksLoadingCircle />;
  }

  return (
    <ButtonsCvaButton
      onTap={handler}
      title={title}
      intent="ghost"
      size="sm"
    >
      {title}
    </ButtonsCvaButton>
  );
};
