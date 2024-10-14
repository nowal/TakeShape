import Image from 'next/image';
import { useAccountSettings } from '@/context/account-settings/provider';
import type { FC } from 'react';
import { ComponentsAccountSettingsUserInputsAddress } from '@/components/account-settings/user/inputs/address';
import { ComponentsAccountSettingsUserInputsPhoneNumber } from '@/components/account-settings/user/inputs/phone-number';
import { InputsText } from '@/components/inputs/text';
import { InputsSelect } from '@/components/inputs/select';
import { InputsFile } from '@/components/inputs/file';
import { IconsUpload } from '@/components/icons/upload';
import { PicOutline } from '@/components/account-settings/user/pic-outline';
import { TypographyFormTitle } from '@/components/typography/form/title';
import { RANGE_VALUES } from '@/constants/map';
import { ComponentsAccountSettingsPainterMap } from '@/components/account-settings/user/painter/map';

export const ComponentsAccountSettingsPainter: FC = () => {
  const {
    range,
    businessName,
    address,
    logoSrc,
    onGeocodeAddress,
    onLogoChange,
    dispatchBusinessName,
    dispatchRange,
  } = useAccountSettings();

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
      <ComponentsAccountSettingsUserInputsAddress />
      <div className="flex flex-row items-center gap-3">
        <TypographyFormTitle>
          Range (miles)
        </TypographyFormTitle>
        <InputsSelect
          name="painter-range"
          value={range.toString()}
          onValueChange={(_, value) => {
            dispatchRange(Number(value));
            onGeocodeAddress(address, Number(value));
          }}
          basicValues={RANGE_VALUES}
          placeholder="Select Range"
          required
        />
      </div>
      <ComponentsAccountSettingsPainterMap />
      <ComponentsAccountSettingsUserInputsPhoneNumber />
      <div className="relative h-[96px]">
        <InputsFile
          title="Company Logo (optional)"
          onFile={onLogoChange}
          inputProps={{
            accept: 'image/png, image/jpeg',
          }}
          classValue="px-6 gap-6"
          center={false}
          isValue={Boolean(logoSrc)}
          icon={{
            Leading: logoSrc
              ? () => (
                  <PicOutline>
                    <Image
                      src={logoSrc}
                      alt="Company Logo"
                      width="64"
                      height="64"
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
