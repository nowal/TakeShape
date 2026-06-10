import { FC } from 'react';
import { useAuth } from '@/context/auth/provider';
import { usePathname } from 'next/navigation';
import { SignInButton } from '@/components/buttons/sign-in-button';
import { SignUpButton } from '@/components/buttons/sign-up/signUpButton';

export const HeaderOptions: FC = () => {
  const { isUserSignedIn } = useAuth();
  const isQuotePage = usePathname() === '/quote';

  return (
    <div className="hidden items-center px-4 gap-2.5 sm:px-2 sm:flex">
      <SignInButton classValue="!bg-[hsl(var(--app-bg-hsl))] !border-black-08 hover:!bg-[hsl(var(--app-bg-hsl)/92%)]" />
      {!isUserSignedIn && !isQuotePage && <SignUpButton />}
    </div>
  );
};
