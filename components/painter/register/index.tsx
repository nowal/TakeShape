import Image from 'next/image';
import type { FC } from 'react';
import { PicOutline } from '@/components/account-settings/user/pic-outline';
import { IconsUpload } from '@/components/icons/upload';
import { InputsFile } from '@/components/inputs/file';
import { usePainterRegister } from '@/context/painter/register/provider';
import { cx } from 'class-variance-authority';
import { useAccountSettings } from '@/context/account-settings/provider';
import { InputsText } from '@/components/inputs/text';
import { ButtonsCvaButton } from '@/components/cva/button';
import { InputsSelect } from '@/components/inputs/select';
import { TypographyFormTitle } from '@/components/typography/form/title';
import { ComponentsAccountSettingsUserInputsAddress } from '@/components/account-settings/user/inputs/address';
import { ComponentsAccountSettingsPainterMap } from '@/components/account-settings/user/painter/map';
import { useAutoFillAddress } from '@/hooks/auto-fill/address';
import { IconsLoading } from '@/components/icons/loading';

export const ComponentsPainterRegister: FC = () => {
  const {
    range,
    businessName,
    dispatchRange,
    dispatchBusinessName,
  } = useAccountSettings();
  const painterRegister = usePainterRegister();
  const {
    isPainterRegisterSubmitting,
    email,
    logoPreview,
    phoneNumber,
    password,
    dispatchPassword,
    dispatchEmail,
    onLogoChange,
    onSubmit,
    dipatchPhoneNumber,
  } = painterRegister;

  useAutoFillAddress();

  const submitTitle = isPainterRegisterSubmitting
    ? 'Submitting...'
    : 'Register';

  const isInputValue = Boolean(logoPreview);

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
      <div className="flex flex-row items-center gap-2">
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
      <ComponentsAccountSettingsPainterMap />
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
          classValue={cx(isInputValue ? 'gap-6' : 'gap-2')}
          isValue={isInputValue}
          center={!isInputValue}
          icon={{
            Leading: logoPreview
              ? () => (
                  <PicOutline>
                    <Image
                      src={logoPreview}
                      alt="Company Logo Preview"
                      className="size-16 object-cover rounded-full"
                      width="64"
                      height="64"
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
        disabled={isPainterRegisterSubmitting}
        intent="primary"
        size="md"
        center
        icon={{
          Leading: isPainterRegisterSubmitting
            ? IconsLoading
            : null,
        }}
        gap='xl'
      >
        {submitTitle}
      </ButtonsCvaButton>
    </form>
  );
};
