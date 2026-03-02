'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SignInPageContent } from '@/components/sign-in/page-content';
import { useAuth } from '@/context/auth/provider';

const HomePage = () => {
  const router = useRouter();
  const { isAuthLoading, isUserSignedIn, menu } = useAuth();
  const {
    isAgent,
    isPainter,
    isFetchingProfilePicture,
  } = menu;
  const isResolvingUserType =
    isUserSignedIn && isFetchingProfilePicture;
  const shouldRedirectToCall =
    !isAuthLoading &&
    !isResolvingUserType &&
    isUserSignedIn &&
    isPainter &&
    !isAgent;

  useEffect(() => {
    if (!shouldRedirectToCall) return;
    router.replace('/call');
  }, [router, shouldRedirectToCall]);

  if (isAuthLoading || isResolvingUserType) {
    return <div className="px-4 sm:px-0" />;
  }

  if (shouldRedirectToCall) {
    return null;
  }

  return (
    <div className="px-4 sm:px-0">
      <SignInPageContent />
    </div>
  );
};

export default HomePage;
