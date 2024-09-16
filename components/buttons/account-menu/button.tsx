'use client';
import { FC } from 'react';
import { IconsLoading } from '@/components/icons/loading';
import { IconsHamburger } from '@/components/icons/hamburger';
import { AccountMenuCross } from '@/components/buttons/account-menu/cross';

type TProps = {
  isDropdownOpen: boolean;
  isLoading: boolean;
  profilePictureUrl: string | null;
};
export const AccountMenuButton: FC<TProps> = ({
  isDropdownOpen,
  isLoading,
  profilePictureUrl,
}) => {
  if (isDropdownOpen) return <AccountMenuCross />;
  if (isLoading)
    return <IconsLoading classValue="size-6 text-white" />;
  if (profilePictureUrl)
    return (
      <img
        src={profilePictureUrl}
        alt="Profile"
        className="w-full h-full object-cover"
      />
    );
  return <IconsHamburger classValue="text-pink size-6" />;
};
