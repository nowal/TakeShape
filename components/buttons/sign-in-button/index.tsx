import { FC } from 'react';
import { ButtonsCvaButton } from '@/components/cva/button';
import { useAuth } from '@/context/auth/provider';
import { useSignInButton } from '@/components/buttons/sign-in-button/hook';
import { FallbacksLoadingCircle } from '@/components/fallbacks/loading/circle';

export const SignInButton: FC = () => {
  const { signIn } = useAuth();
  const { isAuthLoading } = signIn;
  const [title, handler] = useSignInButton();

  if (isAuthLoading) {
    return <FallbacksLoadingCircle />;
  }

  return (
    <ButtonsCvaButton
      onTap={handler}
      title={title}
      intent="ghost"
      layout={false}
      size="sm"
    >
      {title}
    </ButtonsCvaButton>
  );
};
