'use client';
import type { FC } from 'react';
import { CvaButton } from '@/components/cva/button';
import { ComponentsModal } from '@/components/modal';
import { InputsText } from '@/components/inputs/text';
import { CvaLink } from '@/components/cva/link';
import { NotificationsInlineHighlight } from '@/components/notifications/inline/highlight';
import { useAuth } from '@/context/auth/provider';
import { useSignInButton } from '@/components/buttons/sign-in-button/hook';
import { ComponentsPanel } from '@/components/panel';
import { usePathname } from 'next/navigation';
import { IconsLoading16White } from '@/components/icons/loading/16/white';

export const SignInModal: FC = () => {
  const { signIn } = useAuth();
  const {
    isSignInSubmitting,
    isShowModal,
    email,
    password,
    errorMessage,
    onEmailChange,
    onPasswordChange,
    onSignIn,
    onClose,
  } = signIn;
  const [title] = useSignInButton();
  const pathname = usePathname();

  const submitButtonTitle = isSignInSubmitting
    ? 'Logging In...'
    : title;

  const signUpTitle = 'Sign Up';

  if (!isShowModal) return null;
  return (
    <ComponentsModal onTap={onClose}>
      <ComponentsPanel
        title="Login"
        closeProps={{
          title: 'Close Login Modal',
          disabled: isSignInSubmitting,
          onTap: onClose,
        }}
      >
        <>
          <div className="h-4" />
          <form
            onSubmit={onSignIn}
            className="flex flex-col items-stretch"
          >
            <div className="flex flex-col items-stretch gap-4">
              <InputsText
                type="email"
                value={email}
                onChange={onEmailChange}
                placeholder="Email Address"
              />
              <InputsText
                type="password"
                value={password}
                onChange={onPasswordChange}
                placeholder="Password"
              />
              {errorMessage && (
                <NotificationsInlineHighlight>
                  <p>{errorMessage}</p>
                </NotificationsInlineHighlight>
              )}
            </div>
            <div className="h-5" />
            <CvaButton
              title={submitButtonTitle}
              type="submit"
              center
              classValue="w-full text-center font-bold"
              intent="primary"
              icon={{
                Leading: isSignInSubmitting
                  ? IconsLoading16White
                  : null,
              }}
              size="sm"
              disabled={isSignInSubmitting}
              gap='xl'
            >
              {submitButtonTitle}
            </CvaButton>
            {pathname !== '/signup' && (
              <>
                <div className="h-2" />
                <CvaLink
                  href="/signup"
                  title={signUpTitle}
                  size="sm"
                  center
                  classValue="w-full"
                >
                  <span className="text-pink font-bold">
                    {signUpTitle}
                  </span>
                </CvaLink>
              </>
            )}
          </form>
        </>
      </ComponentsPanel>
    </ComponentsModal>
  );
};
