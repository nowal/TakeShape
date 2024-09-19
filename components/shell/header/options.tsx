import { FC } from 'react';
import { SignInButton } from '../../buttons/sign-in-button';
import QuoteButton from '../../buttons/quote/quoteButton';
import { AccountMenu } from '../../buttons/account-menu';
import { useAuth } from '@/context/auth/provider';
import { usePathname } from 'next/navigation';

export const HeaderOptions: FC = () => {
  const { isUserSignedIn } = useAuth();
  const isQuotePage = usePathname() === '/quote';

  return (
    <div className="hidden items-center px-4 gap-2.5 sm:px-2 sm:flex">
     
      {!isUserSignedIn && <SignInButton />}
      {!isQuotePage && <QuoteButton />}
      {isUserSignedIn && <AccountMenu />}
    </div>
  );
};
