'use client';
import type { FC } from 'react';
import { ButtonsCvaButton } from '@/components/cva/button';
import { ComponentsModal } from '@/components/modal';
import { InputsText } from '@/components/inputs/text';
import { ButtonsCvaLink } from '@/components/cva/link';
import { NotificationsHighlight } from '@/components/notifications/highlight';
import { IconsCloseFat } from '@/components/icons/close/fat';
import { useAuth } from '@/context/auth/provider';
import { useSignInButton } from '@/components/buttons/sign-in-button/hook';

export const SignInModal: FC = () => {
  const { signIn, isUserSignedIn } = useAuth();
  const {
    isLoading,
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

  const submitButtonTitle = isLoading
    ? 'Logging In...'
    : title;

  const signUpTitle = 'Sign Up';
  if (!isShowModal) return null;
  return (
    <ComponentsModal onTap={onClose}>
      <div className="fill-column-white-sm w-[345px]">
        <h4 className="typography-page-title-semibold">
          Login
        </h4>
        <div className="h-4" />
        <div className="absolute bottom-full -translate-y-3 right-0">
          <ButtonsCvaButton
            title="Close Login Modal"
            disabled={isLoading}
            onTap={onClose}
            isIconOnly
            rounded="full"
            center
            size="iconLg"
            intent="icon"
            classValue="bg-black hover:bg-gray-7 active:bg-pink text-white"
          >
            <IconsCloseFat />
          </ButtonsCvaButton>
        </div>
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
              classRounded="rounded-lg"
            />
            <InputsText
              type="password"
              value={password}
              onChange={onPasswordChange}
              placeholder="Password"
              classRounded="rounded-lg"
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
            disabled={isLoading}
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
      </div>
    </ComponentsModal>
  );
};
