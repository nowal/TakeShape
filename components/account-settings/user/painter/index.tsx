import Image from 'next/image';
import { useAccountSettings } from '@/context/account-settings/provider';
import type { FC } from 'react';
import { ComponentsAccountSettingsUserInputsAddress } from '@/components/account-settings/user/inputs/address';
import { ComponentsAccountSettingsUserInputsPhoneNumber } from '@/components/account-settings/user/inputs/phone-number';
import { ComponentsAccountSettingsPainterMarker } from '@/components/account-settings/user/painter/marker';

export const ComponentsAccountSettingsPainter: FC = () => {
  const {
    range,
    businessName,
    address,
    mapRef,
    logoSrc,
    onLogoChange,
    dispatchBusinessName,
    dispatchRange,
  } = useAccountSettings();
  return (
    <>
      <div>
        <label
          htmlFor="businessName"
          className="block text-md font-medium text-gray-700"
        >
          Business or Personal Name
        </label>
        <input
          type="text"
          id="businessName"
          value={businessName}
          onChange={(event) =>
            dispatchBusinessName(event.target.value)
          }
          placeholder="Enter your business or personal name"
          required
          className="p-2 border rounded w-full"
        />
      </div>

      <ComponentsAccountSettingsUserInputsAddress type="address" />

      <div>
        <label
          htmlFor="range"
          className="block text-md font-medium text-gray-700"
        >
          Range (miles)
        </label>
        <select
          id="range"
          value={range}
          onChange={(e) =>
            dispatchRange(Number(e.target.value))
          }
          required
          className="p-2 border rounded w-full"
        >
          {[10, 20, 30, 40, 50].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
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
