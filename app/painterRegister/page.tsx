'use client';
import Image from 'next/image';
import { InputsFile } from '@/components/inputs/file';
import { PicOutline } from '@/components/account-settings/user/pic-outline';
import { IconsUpload } from '@/components/icons/upload';
import { cx } from 'class-variance-authority';
import { usePainterRegister } from '@/context/painter/register/state';
import { useAccountSettings } from '@/context/account-settings/provider';
import { useAuth } from '@/context/auth/provider';
import { ComponentsAccountSettingsNotifications } from '@/components/account-settings/notifications';

const PainterRegisterPage = () => {
  const {} = useAuth();
  const {
    address,
    dispatchAddress,
    addressInputRef,
    range,
    dispatchRange,
    mapRef,
  } = useAccountSettings();
  const painterRegister = usePainterRegister();
  const {
    isLoading,
    lat,
    lng,
    errorMessage,
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

  return (
    <div className="relative flex flex-col gap-5 items-center">
      <h2 className="typography-page-title">
        Painter Registration
      </h2>
      <div className="relative flex flex-col gap-5 items-center w-[320px] sm:w-[382px]">
        <div className="fill-column-white-sm">
          {errorMessage && (
            <ComponentsAccountSettingsNotifications>
              {errorMessage}
            </ComponentsAccountSettingsNotifications>
          )}

          <form
            onSubmit={onSubmit}
            className="flex flex-col space-y-4"
          >

                      </form>
        </div>
      </div>
    </div>
  );
};

export default PainterRegisterPage;
