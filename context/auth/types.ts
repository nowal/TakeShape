import { useSignOut } from '@/context/auth/sign-out';
import { Dispatch } from 'react';

export type TAuthSignOutConfig = {
  profilePictureSrc: string | null;
  isUserSignedIn: boolean;
  isAuthLoading: boolean;
  dispatchAuthLoading: Dispatch<boolean>;
  dispatchUserSignedIn: Dispatch<boolean>;
  dispatchProfilePictureUrl: Dispatch<string | null>;
};

export type TAuthConfig = TAuthSignOutConfig &
  ReturnType<typeof useSignOut>;
