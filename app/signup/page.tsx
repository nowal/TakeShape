'use client';
import { Suspense, useEffect } from 'react';
import { GoogleAnalytics } from '@next/third-parties/google';
import { InputsText } from '@/components/inputs/text';
import { ButtonsCvaButton } from '@/components/cva/button';
import { FallbacksLoading } from '@/components/fallbacks/loading';
import { SignUpSignIn } from '@/components/sign-up/sign-in';
import { ALREADY_HAVE_AN_ACCOUNT_TEXT } from '@/components/sign-up/constants';
import { useAuth } from '@/context/auth/provider';
import { SignUpNotificationsError } from '@/components/sign-up/notifications/error';
import { PreferencesNotificationsInlineInformation } from '@/components/preferences/notifications/information';
import { InputsAddress } from '@/components/account-settings/user/inputs/address';
import { IconsLoading16White } from '@/components/icons/loading/16/white';

const SignupAccountForm = () => {
  const { signUp, signIn } = useAuth();
  const {
    isSignUpSubmitting,
    errorMessage,
    isShowLoginInstead,
    name,
    email,
    password,
    onSignUpSubmit,
    dispatchEmail,
    dispatchName,
    dispatchPassword,
    dispatchShowLoginInstead,
  } = signUp;
  const { onClose, onSignInButtonClick } = signIn;

  useEffect(() => {
    onClose();
  }, []);

  const submitButtonTitle = isSignUpSubmitting
    ? 'Signing up...'
    : 'Sign Up';

  if (isShowLoginInstead) {
    return (
      <SignUpSignIn
        onTap={() => dispatchShowLoginInstead(false)}
      />
    );
  }

  return (
    <div className="flex flex-col items-stretch gap-6 mt-8">
      <GoogleAnalytics gaId="G-47EYLN83WE" />
      <h2 className="typography-page-title">
        Sign Up for Your Free Quote
      </h2>
      <div className="relative flex flex-col items-center">
        <div className="relative flex flex-col gap-5 items-center w-[320px] sm:w-[382px]">
          {errorMessage && (
            <SignUpNotificationsError>
              {errorMessage}
            </SignUpNotificationsError>
          )}
          <div className="rounded-3xl px-4 py-6 w-full fill-column-white-sm">
            <form
              onSubmit={onSignUpSubmit}
              className="flex flex-col gap-4"
            >
              <InputsText
                type="email"
                value={email}
                onChange={(event) =>
                  dispatchEmail(event.target.value)
                }
                placeholder="Email Address"
                required
              />
              <InputsText
                id="name"
                value={name}
                onChange={(event) =>
                  dispatchName(event.target.value)
                }
                placeholder="Name"
                required
              />
              <InputsAddress />
              <InputsText
                type="password"
                value={password}
                onChange={(event) =>
                  dispatchPassword(event.target.value)
                }
                placeholder="Password"
                required
              />
              <ButtonsCvaButton
                type="submit"
                isDisabled={isSignUpSubmitting}
                title={submitButtonTitle}
                icon={{
                  Leading: isSignUpSubmitting
                    ? IconsLoading16White
                    : null,
                }}
                intent="primary"
                size="md"
                center
                gap="xl"
              >
                <div className="text-base font-bold">
                  {submitButtonTitle}
                </div>
              </ButtonsCvaButton>
            </form>
            <div className="mt-3.5 text-center">
              <p className="flex flex-row justify-center gap-1.5">
                <span className="text-black-5">
                  {ALREADY_HAVE_AN_ACCOUNT_TEXT}
                </span>
                <ButtonsCvaButton
                  isDisabled={isSignUpSubmitting}
                  title={submitButtonTitle}
                  onTap={onSignInButtonClick}
                  className="hover:underline"
                >
                  <div className="text-pink text-base font-bold">
                    Login
                  </div>
                </ButtonsCvaButton>
              </p>
            </div>
          </div>
          <PreferencesNotificationsInlineInformation />
        </div>
      </div>
    </div>
  );
};

export default function SignupAccountPage() {
  return (
    <Suspense fallback={<FallbacksLoading />}>
      <SignupAccountForm />
    </Suspense>
  );
}
