import { FC } from 'react';
import Link from 'next/link';
import { ButtonsCvaButton } from '@/components/cva/button';
import { createPortal } from 'react-dom';
import { Modal } from '@/components/modal';
import { THeaderOptionsProps } from '@/components/shell/header/options';
import { FallbacksLoading } from '@/components/fallbacks/loading';
import { useSignIn } from '@/components/buttons/sign-in-button/hook';
import { title } from 'process';

export type TSignInButtonProps = THeaderOptionsProps & {
  className?: string;
};
const SignInButton: FC<TSignInButtonProps> = ({
  className,
  ...props
}) => {
  const signIn = useSignIn(props);
  const {
    isLoading,
    isShowModal,
    isAuthLoading,
    email,
    password,
    errorMessage,
    onEmailChange,
    onPasswordChange,
    onSignIn,
    onClick,
    onClose,
  } = signIn;

  if (isAuthLoading) {
    return <FallbacksLoading />; // Or any other loading indicator
  }
  return (
    <>
      <ButtonsCvaButton
        onTap={onClick}
        className={`${className || ''}`}
        title={title}
        intent="ghost"
        layout={false}
        size="sm"
      >
        {title}
      </ButtonsCvaButton>
      {isShowModal && (
        <>
          {createPortal(
            <Modal onTap={onClose}>
              <div className="modal-overlay">
                <div className="modal-content secondary-color">
                  <button
                    onClick={onClose}
                    className="close-modal"
                  >
                    X
                  </button>
                  <form
                    onSubmit={onSignIn}
                    className="flex flex-col space-y-4"
                  >
                    <input
                      type="email"
                      value={email}
                      onChange={onEmailChange}
                      placeholder="Email"
                      className="p-2 border rounded w-full"
                    />
                    <input
                      type="password"
                      value={password}
                      onChange={onPasswordChange}
                      placeholder="Password"
                      className="p-2 border rounded w-full"
                    />
                    {errorMessage && (
                      <p className="text-red-600">
                        {errorMessage}
                      </p>
                    )}{' '}
                    {/* Display error message */}
                    <button
                      type="submit"
                      className={`text-sm sm:text-bas button-green ${
                        isLoading
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                      }`}
                      disabled={isLoading}
                    >
                      {isLoading
                        ? 'Logging In...'
                        : 'Log in'}
                    </button>
                    <Link
                      className="text-center text-blue-600 underline"
                      onClick={onClose}
                      href="/signup"
                    >
                      Sign Up
                    </Link>
                  </form>
                </div>
              </div>
            </Modal>,
            document.body
          )}
        </>
      )}
    </>
  );
};

export default SignInButton;
