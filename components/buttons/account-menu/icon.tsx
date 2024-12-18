'use client';
import Image from 'next/image';
import { FC } from 'react';
import { IconsLoading } from '@/components/icons/loading';
import { IconsHamburger } from '@/components/icons/hamburger';
import { AccountMenuCross } from '@/components/buttons/account-menu/cross';
import { useAuth } from '@/context/auth/provider';
import { useAccountSettings } from '@/context/account-settings/provider';

export const AccountMenuIcon: FC = () => {
  const { profilePictureSrc } = useAccountSettings();
  const { menu } = useAuth();
  const { isMenuOpen, isFetchingProfilePicture } = menu;
  if (isMenuOpen) return <AccountMenuCross />;
  if (isFetchingProfilePicture)
    return <IconsLoading classValue="size-6 text-white" />;
  if (profilePictureSrc)
    return (
      <img  // Use the standard img tag
        src={profilePictureSrc}
        alt="Profile"
        className="size-12 object-cover rounded-full"
        width="48"
        height="48"
      />
    );
  return <IconsHamburger classValue="text-pink size-6" />;
};
