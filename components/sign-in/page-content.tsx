'use client';

import { useEffect } from 'react';
import { CvaButton } from '@/components/cva/button';
import { CvaLink } from '@/components/cva/link';
import { InputsText } from '@/components/inputs/text';
import { NotificationsInlineHighlight } from '@/components/notifications/inline/highlight';
import { useAuth } from '@/context/auth/provider';
import { IconsLoading16White } from '@/components/icons/loading/16/white';
import { ComponentsRegisterShell } from '@/components/register/shell';

export const SignInPageContent = () => {
  const { signIn } = useAuth();
  const {
    isSignInSubmitting,
    email,
    password,
    errorMessage,
    onEmailChange,
    onPasswordChange,
    onSignIn,
    onClose,
  } = signIn;

  useEffect(() => {
    onClose();
  }, []);

  const submitButtonTitle = isSignInSubmitting
    ? 'Logging In...'
    : 'Login';

  return (
    <ComponentsRegisterShell title="Provider Login">
      <>
        <form
          onSubmit={onSignIn}
          className="flex flex-col items-stretch gap-4 px-4 py-6"
        >
          <InputsText
            type="email"
            value={email}
            onChange={onEmailChange}
            placeholder="Email Address"
            required
          />
          <InputsText
            type="password"
            value={password}
            onChange={onPasswordChange}
            placeholder="Password"
            required
          />
          {errorMessage && (
            <NotificationsInlineHighlight>
              <p>{errorMessage}</p>
            </NotificationsInlineHighlight>
          )}
          <CvaButton
            title={submitButtonTitle}
            type="submit"
            center
            intent="primary"
            size="md"
            classValue="w-full font-bold"
            icon={{
              Leading: isSignInSubmitting
                ? IconsLoading16White
                : null,
            }}
            gap="xl"
            isDisabled={isSignInSubmitting}
          >
            <div className="text-base font-bold">
              {submitButtonTitle}
            </div>
          </CvaButton>
          <div className="flex flex-col gap-0.5">
            <CvaLink
              href="/providerRegister"
              title="Sign Up"
              size="md"
              center
              classValue="w-full"
            >
              <span className="text-pink font-bold">
                Sign Up
              </span>
            </CvaLink>
            <p className="text-center text-sm font-medium text-black sm:text-base">
              Please call (865) 242-9705 for inquiries
            </p>
          </div>
        </form>
      </>
    </ComponentsRegisterShell>
  );
};
