'use client';

import { SignInButton } from '@/components/buttons/sign-in-button';

export const ShellHeaderMobileMenu = () => (
  <div className="relative flex shrink-0 items-center justify-center sm:hidden">
    <SignInButton classValue="!bg-[hsl(var(--app-bg-hsl))] !border-black-08 shadow-09 hover:!bg-[hsl(var(--app-bg-hsl)/92%)]" />
  </div>
);
