import { FC } from 'react';
import { useAuth } from '@/context/auth/provider';
import { usePathname } from 'next/navigation';
import { AccountMenu } from '@/components/buttons/account-menu';
import { SignInButton } from '@/components/buttons/sign-in-button';
import { QuoteButton } from '@/components/buttons/quote/quoteButton';

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
