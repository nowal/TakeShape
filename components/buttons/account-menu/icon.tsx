'use client';
import Image from 'next/image';
import { FC } from 'react';
import { IconsLoading } from '@/components/icons/loading';
import { IconsHamburger } from '@/components/icons/hamburger';
import { AccountMenuCross } from '@/components/buttons/account-menu/cross';

type TProps = {
  isMenuOpen: boolean;
  isLoading: boolean;
  profilePictureUrl: string | null;
};
export const AccountMenuIcon: FC<TProps> = ({
  isMenuOpen,
  isLoading,
  profilePictureUrl,
}) => {
  if (isMenuOpen) return <AccountMenuCross />;
  if (isLoading)
    return <IconsLoading classValue="size-6 text-white" />;
  if (profilePictureUrl)
    return (
      <Image
        src={profilePictureUrl}
        alt="Profile"
        className="size-6 object-cover"
        width="24"
        height="24"
      />
    );
  return <IconsHamburger classValue="text-pink size-6" />;
};
