import Image from 'next/image';
import { useAccountSettings } from '@/context/account-settings/provider';
import type { FC } from 'react';
import { ComponentsAccountSettingsUserInputsAddress } from '@/components/account-settings/user/inputs/address';
import { ComponentsAccountSettingsUserInputsPhoneNumber } from '@/components/account-settings/user/inputs/phone-number';
import { ComponentsAccountSettingsPainterMarker } from '@/components/account-settings/user/painter/marker';
import { InputsText } from '@/components/inputs/text';
import { InputsSelect } from '@/components/inputs/select';

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

      <ComponentsAccountSettingsUserInputsAddress type="address" />

      <div className="flex flex-row items-center gap-3">
        <h3 className="typography-form-title">
          Range (miles)
        </h3>
        <InputsSelect
          name="range"
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
      <div>
        <label
          htmlFor="logo"
          className="block text-md font-medium text-gray-700"
        >
          Company Logo (optional)
        </label>
        {logoSrc && (
          <Image
            src={logoSrc}
            alt="Company Logo"
            className="mb-2 w-24 h-24 object-cover rounded-full"
            width="96"
            height="96"
          />
        )}
        <input
          type="file"
          id="logo"
          accept="image/png, image/jpeg, application/pdf"
          onChange={onLogoChange}
          className="p-2 border rounded w-full"
        />
      </div>
    </>
  );
};