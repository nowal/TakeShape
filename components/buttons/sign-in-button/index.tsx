import { FC } from 'react';
import { ButtonsCvaButton } from '@/components/cva/button';
import { FallbacksLoading } from '@/components/fallbacks/loading';
import { useAuth } from '@/context/auth/provider';
import { useSignInButton } from '@/components/buttons/sign-in-button/hook';

export const SignInButton: FC = () => {
  const { signIn } = useAuth();
  const { isAuthLoading } = signIn;
  const [title, handler] = useSignInButton();

  if (isAuthLoading) {
    return <FallbacksLoading />; // Or any other loading indicator
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
