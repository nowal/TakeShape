import Image from 'next/image';
import { useAccountSettings } from '@/context/account-settings/provider';
import type { FC } from 'react';
import { ComponentsAccountSettingsUserInputsAddress } from '@/components/account-settings/user/inputs/address';
import { ComponentsAccountSettingsUserInputsPhoneNumber } from '@/components/account-settings/user/inputs/phone-number';
import { ComponentsAccountSettingsPainterMarker } from '@/components/account-settings/user/painter/marker';
import { InputsText } from '@/components/inputs/text';
import { InputsSelect } from '@/components/inputs/select';
import { InputsFile } from '@/components/inputs/file';
import { IconsUpload } from '@/components/icons/upload';
import { PicOutline } from '@/components/account-settings/user/pic-outline';
import { TypographyFormTitle } from '@/components/typography/form/title';

const RANGE_VALUES = [10, 20, 30, 40, 50] as const;

export const ComponentsAccountSettingsPainter: FC = () => {
  const {
    range,
    businessName,
    address,
    mapRef,
    logoSrc,
    // onInitializeMap,
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
          // classRounded="rounded-lg"
          // required
        />
        {/* <label
          htmlFor="range"
          className="block text-md font-medium text-gray-700"
        >
        </label> */}
        {/* <select
          id="range"
          value={range}
          onChange={(e) =>
            dispatchRange(Number(e.target.value))
          }
          required
          className="p-2 border rounded w-full"
        >
          {RANGE_VALUES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select> */}
      </div>

      {address && (
        <ComponentsAccountSettingsPainterMarker
          mapRef={mapRef}
        />
      )}
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
