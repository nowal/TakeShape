import { useAccountSettings } from '@/context/account-settings/provider';
import type { FC } from 'react';
import { InputsText } from '@/components/inputs/text';
import { InputsFile } from '@/components/inputs/file';
import { IconsUpload } from '@/components/icons/upload';
import { cx } from 'class-variance-authority';
import { InputsFilePic } from '@/components/inputs/file/pic';
import { PainterAddress } from '@/components/painter/address';
import { ComponentsAccountSettingsUserInputsPhoneNumber } from '@/components/account-settings/user/inputs/phone-number';

export const ComponentsAccountSettingsPainter: FC = () => {
  const {
    businessName,
    logoSrc,
    onLogoChange,
    dispatchBusinessName,
  } = useAccountSettings();

  const isInputValue = Boolean(logoSrc);

  return (
    <>
      <div>
        <InputsText
          value={businessName}
          onChange={(event) =>
            dispatchBusinessName(event.target.value)
          }
          placeholder="Business or Personal Name"
          required
        />
      </div>
      <PainterAddress />
      <ComponentsAccountSettingsUserInputsPhoneNumber />
      <div className="relative h-[96px]">
        <InputsFile
          title="Company Logo"
          onFile={onLogoChange}
          inputProps={{
            accept: 'image/*',
          }}
          classValue={cx(isInputValue ? 'gap-6' : 'gap-2')}
          isValue={isInputValue}
          center={!isInputValue}
          icon={{
            Leading: logoSrc
              ? () => (
                  <InputsFilePic
                    src={logoSrc}
                    alt="Company Logo"
                  />
                )
              : IconsUpload,
          }}
        />
      </div>
    </>
  );
};
