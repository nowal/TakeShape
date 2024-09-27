'use client';
import { Suspense } from 'react';
import { GoogleAnalytics } from '@next/third-parties/google';
import { InputsText } from '@/components/inputs/text';
import { ButtonsCvaButton } from '@/components/cva/button';
import { NotificationsHighlight } from '@/components/notifications/highlight';
import { FallbacksLoading } from '@/components/fallbacks/loading';
import { SignUpSignIn } from '@/components/sign-up/sign-in';
import { ALREADY_HAVE_AN_ACCOUNT_TEXT } from '@/components/sign-up/constants';
import { useSignUp } from '@/context/auth/sign-up';
import { useAuth } from '@/context/auth/provider';
import { SignUpNotificationsError } from '@/components/sign-up/notifications/error';

const SignupAccountForm = () => {
  const { signUp, signIn } = useAuth();
  const {
    isLoading,
    errorMessage,
    isShowLoginInstead,
    name,
    email,
    address,
    password,
    onSubmit,
    onAddressChange,
    dispatchEmail,
    dispatchName,
    dispatchPassword,
    dispatchShowLoginInstead,
    addressInputRef,
  } = signUp;

  const submitButtonTitle = isLoading
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
          <div className="rounded-3xl bg-white shadow-08 px-4 py-6 w-full fill-column-white-sm">
            <form
              onSubmit={onSubmit}
              className="flex flex-col gap-y-4"
            >
              <InputsText
                type="email"
                id="email"
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
              <InputsText
                id="address"
                ref={addressInputRef}
                value={address}
                onChange={onAddressChange}
                placeholder="Address"
                required
              />
              <InputsText
                type="password"
                id="password"
                value={password}
                onChange={(e) =>
                  dispatchPassword(e.target.value)
                }
                placeholder="Password"
                required
              />
              <ButtonsCvaButton
                type="submit"
                isDisabled={isLoading}
                title={submitButtonTitle}
                intent="primary"
                size="md"
                center={true}
              >
                <div className="text-base font-bold">
                  {submitButtonTitle}
                </div>
              </ButtonsCvaButton>
            </form>
            <div className="mt-3.5 text-center">
              <p className="flex flex-row  justify-center gap-1.5">
                <span className="text-black-5">
                  {ALREADY_HAVE_AN_ACCOUNT_TEXT}
                </span>
                <ButtonsCvaButton
                  isDisabled={isLoading}
                  title={submitButtonTitle}
                  onTap={() => {
                    //dispatchShowLoginInstead(true);
                    signIn.onSignInButtonClick();
                  }}
                  className="text-blue-600 hover:underline"
                >
                  <div className="text-pink text-base font-bold">
                    Login
                  </div>
                </ButtonsCvaButton>
              </p>
            </div>
          </div>
          <NotificationsHighlight>
            None of your information will be shared with
            painters until you accept a quote. Rest assured,
            your privacy is our priority.
          </NotificationsHighlight>
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
