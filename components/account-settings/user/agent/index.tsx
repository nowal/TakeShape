import { ComponentsAccountSettingsUserInputsName } from '@/components/account-settings/user/inputs/name';
import { useAccountSettings } from '@/context/account-settings/provider';
import type { FC } from 'react';
import Image from 'next/image';
import { InputsFile } from '@/components/inputs/file';
import { PicOutline } from '@/components/account-settings/user/pic-outline';
import { IconsUpload } from '@/components/icons/upload';

export const ComponentsAccountSettingsAgent: FC = () => {
  const { profilePictureSrc, onProfilePictureChange } =
    useAccountSettings();

  return (
    <>
      <ComponentsAccountSettingsUserInputsName />
      <div className="relative h-24">
        <InputsFile
          title="Profile Picture"
          onFile={onProfilePictureChange}
          inputProps={{
            accept: 'image/*',
          }}
          gap='2xl'
          classValue="px-5.5"
          center={false}
          isValue={Boolean(profilePictureSrc)}
          icon={{
            Leading: profilePictureSrc
              ? () => (
                  <PicOutline>
                    <Image
                      src={profilePictureSrc}
                      alt="Profile Picture"
                      className="mb-2 w-24 h-24 object-cover rounded-full"
                      width="96"
                      height="96"
                    />
                  </PicOutline>
                )
              : IconsUpload,
          }}
        />
      </div>
    </>
  );
};
