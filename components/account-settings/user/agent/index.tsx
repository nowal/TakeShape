import { ComponentsAccountSettingsUserInputsName } from '@/components/account-settings/user/inputs/name';
import { useAccountSettings } from '@/context/account-settings/provider';
import type { FC } from 'react';
import { InputsFile } from '@/components/inputs/file';
import { IconsUpload } from '@/components/icons/upload';
import { InputsFilePic } from '@/components/inputs/file/pic';

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
          gap="2xl"
          classValue="px-5.5"
          center={false}
          isValue={Boolean(profilePictureSrc)}
          icon={{
            Leading: profilePictureSrc
              ? () => (
                  <InputsFilePic
                    src={profilePictureSrc}
                    alt="Profile Picture"
                  />
                )
              : IconsUpload,
          }}
        />
      </div>
    </>
  );
};
