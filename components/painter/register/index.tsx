import Image from 'next/image';
import type { FC } from 'react';
import { PicOutline } from '@/components/account-settings/user/pic-outline';
import { IconsUpload } from '@/components/icons/upload';
import { InputsFile } from '@/components/inputs/file';
import { usePainterRegister } from '@/context/painter/register/provider';
import { cx } from 'class-variance-authority';
import { useAccountSettings } from '@/context/account-settings/provider';
import { useAuth } from '@/context/auth/provider';
import { InputsText } from '@/components/inputs/text';
import { ButtonsCvaButton } from '@/components/cva/button';
import { ComponentsPainterRegisterCoords } from '@/components/painter/register/coords';
import { InputsSelect } from '@/components/inputs/select';
import { TypographyFormTitle } from '@/components/typography/form/title';
import { ComponentsAccountSettingsUserInputsAddress } from '@/components/account-settings/user/inputs/address';

export const ComponentsPainterRegister: FC = () => {
  const {
    address,
    dispatchAddress,
    addressInputRef,
    range,
    dispatchRange,
  } = useAccountSettings();
  const painterRegister = usePainterRegister();
  const {
    isLoading,
    lat,
    lng,
    email,
    businessName,
    logoPreview,
    phoneNumber,
    password,
    dispatchPassword,
    dispatchEmail,
    onLogoChange,
    onSubmit,
    dispatchBusinessName,
    dipatchPhoneNumber,
  } = painterRegister;

  const submitTitle = isLoading
    ? 'Registering...'
    : 'Register';

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-4"
    >
      <InputsText
        value={businessName}
        onChange={(event) =>
          dispatchBusinessName(event.target.value)
        }
        placeholder="Business or Personal Name"
        required
      />
      <ComponentsAccountSettingsUserInputsAddress />
      <div className="flex flex-row us gap-2">
        <TypographyFormTitle>Range</TypographyFormTitle>
        <InputsSelect
          name="range"
          placeholder="Range (miles)"
          value={range.toString()}
          onValueChange={(_, value) =>
            dispatchRange(Number(value))
          }
          required
          basicValues={[10, 20, 30, 40, 50]}
        />
      </div>

      {lat !== 0 && lng !== 0 && (
        <ComponentsPainterRegisterCoords />
      )}
      <InputsText
        type="tel"
        value={phoneNumber}
        onChange={(event) =>
          dipatchPhoneNumber(event.target.value)
        }
        placeholder="Phone Number"
        required
      />
      <div className="relative h-[96px]">
        <InputsFile
          title="Company Logo (optional)"
          onFile={onLogoChange}
          inputProps={{
            accept: 'image/*',
          }}
          classValue={cx(
            'px-4',
            logoPreview ? 'gap-6' : 'gap-2'
          )}
          isValue={Boolean(logoPreview)}
          icon={{
            Leading: logoPreview
              ? () => (
                  <PicOutline>
                    <Image
                      src={logoPreview}
                      alt="Company Logo Preview"
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
      <InputsText
        type="email"
        value={email}
        onChange={(event) =>
          dispatchEmail(event.target.value)
        }
        placeholder="Email Address"
        required
      />
      <InputsText
        type="password"
        value={password}
        onChange={(event) =>
          dispatchPassword(event.target.value)
        }
        placeholder="Password"
        required
      />
      <ButtonsCvaButton
        title={submitTitle}
        type="submit"
        disabled={isLoading}
        intent="primary"
        size="md"
        center
      >
        {submitTitle}
      </ButtonsCvaButton>
    </form>
  );
};
