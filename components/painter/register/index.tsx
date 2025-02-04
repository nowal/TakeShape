import type { FC } from 'react';
import { InputsFilePic } from '@/components/inputs/file/pic';
import { IconsUpload } from '@/components/icons/upload';
import { InputsFile } from '@/components/inputs/file';
import { usePainterRegister } from '@/context/painter/register/provider';
import { cx } from 'class-variance-authority';
import { useAccountSettings } from '@/context/account-settings/provider';
import { InputsText } from '@/components/inputs/text';
import { CvaButton } from '@/components/cva/button';
import { PainterAddress } from '@/components/painter/address';
import { IconsLoading16White } from '@/components/icons/loading/16/white';

export const ComponentsPainterRegister: FC = () => {
  const { businessName, dispatchBusinessName } =
    useAccountSettings();
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
      <PainterAddress />
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
          title="Company Logo"
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
                  <InputsFilePic
                    src={logoPreview}
                    alt="Company Logo Preview"
                  />
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
      <CvaButton
        title={submitTitle}
        type="submit"
        disabled={isPainterRegisterSubmitting}
        intent="primary"
        size="md"
        center
        icon={{
          Leading: isPainterRegisterSubmitting
            ? IconsLoading16White
            : null,
        }}
        gap="xl"
      >
        {submitTitle}
      </CvaButton>
    </form>
  );
};
