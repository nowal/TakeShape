import { ComponentsAccountSettingsUserInputsName } from '@/components/account-settings/user/inputs/name';
import { useAccountSettings } from '@/context/account-settings/provider';
import type { FC } from 'react';
import Image from 'next/image';

export const ComponentsAccountSettingsAgent: FC = () => {
  const { profilePicSrc, onProfilePictureChange } =
    useAccountSettings();

  return (
    <>
      <ComponentsAccountSettingsUserInputsName />
      <div>
        <label
          htmlFor="profilePicture"
          className="block text-md font-medium text-gray-700"
        >
          Profile Picture
        </label>
        {profilePicSrc && (
          <Image
            src={profilePicSrc}
            alt="Profile Picture"
            className="mb-2 w-24 h-24 object-cover rounded-full"
          />
        )}
        <input
          type="file"
          id="profilePicture"
          accept="image/png, image/jpeg"
          onChange={onProfilePictureChange}
          className="p-2 border rounded w-full"
        />
      </div>
    </>
  );
};
