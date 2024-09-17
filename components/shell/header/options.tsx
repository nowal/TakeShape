import { FC } from 'react';
import SignInButton from '../../buttons/sign-in-button';
import QuoteButton from '../../buttons/quote/quoteButton';
import { AccountMenu } from '../../buttons/account-menu';
import { cx } from 'class-variance-authority';
import { useAuth } from '@/context/auth/provider';
import { usePathname } from 'next/navigation';

export const HeaderOptions: FC = () => {
  const { isUserLoggedIn } = useAuth();
  const isQuotePage = usePathname() === '/quote';

  return (
    <div className="hidden items-center px-4 gap-2.5 sm:px-2 lg:flex">
      <div
        className={cx(
          'absolute inset-0',
          'shadow-09 lg:shadow-08',
          'rounded-[0.70013rem] lg:rounded-15.1875',
          isUserLoggedIn ? 'bg-white-5' : 'bg-white'
        )}
      />
      {!isUserLoggedIn && <SignInButton />}
      {!isQuotePage && <QuoteButton />}
      {isUserLoggedIn && <AccountMenu />}
    </div>
  );
};
