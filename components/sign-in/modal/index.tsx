'use client';
import type { FC } from 'react';
import { ButtonsCvaButton } from '@/components/cva/button';
import { ComponentsModal } from '@/components/modal';
import { InputsText } from '@/components/inputs/text';
import { ButtonsCvaLink } from '@/components/cva/link';
import { NotificationsHighlight } from '@/components/notifications/highlight';
import { useAuth } from '@/context/auth/provider';
import { useSignInButton } from '@/components/buttons/sign-in-button/hook';
import { ComponentsPanel } from '@/components/panel';

export const SignInModal: FC = () => {
  const { signIn } = useAuth();
  const {
    isSigningIn,
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

  const submitButtonTitle = isSigningIn
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
          disabled: isSigningIn,
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
                <NotificationsHighlight>
                  <p>{errorMessage}</p>
                </NotificationsHighlight>
              )}
            </div>
            <div className="h-5" />
            <ButtonsCvaButton
              title={submitButtonTitle}
              type="submit"
              center
              classValue="w-full text-center font-bold"
              intent="primary"
              size="sm"
              disabled={isSigningIn}
            >
              {submitButtonTitle}
            </ButtonsCvaButton>
            <div className="h-2" />
            <ButtonsCvaLink
              onTap={onClose}
              href="/signup"
              title={signUpTitle}
              size="sm"
              center
              classValue="w-full"
            >
              <span className="text-pink font-bold">
                {signUpTitle}
              </span>
            </ButtonsCvaLink>
          </form>
        </>
      </ComponentsPanel>
    </ComponentsModal>
  );
};
