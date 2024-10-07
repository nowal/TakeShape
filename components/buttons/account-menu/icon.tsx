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
  const { menu, onNavigateScrollTopClick } = useAuth();
  const { isMenuOpen, isLoading } = menu;
  if (isMenuOpen) return <AccountMenuCross />;
  if (isLoading)
    return <IconsLoading classValue="size-6 text-white" />;
  if (profilePictureSrc)
    return (
      <Image
        src={profilePictureSrc}
        alt="Profile"
        className="size-6 object-cover"
        width="24"
        height="24"
      />
    );
  return <IconsHamburger classValue="text-pink size-6" />;
};
