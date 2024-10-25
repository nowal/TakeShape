import { FC } from 'react';
import { CvaButton } from '@/components/cva/button';
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
    <CvaButton
      onTap={handler}
      title={title}
      intent="ghost"
      size="sm"
    >
      {title}
    </CvaButton>
  );
};
