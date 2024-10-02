'use client';
import { usePainterRegister } from '@/context/painter/register/provider';
import { useAccountSettings } from '@/context/account-settings/provider';
import { useAuth } from '@/context/auth/provider';
import { ComponentsAccountSettingsNotifications } from '@/components/account-settings/notifications';
import { ComponentsPainterRegister } from '@/components/painter/register';

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

    
            <ComponentsPainterRegister />

        </div>
      </div>
    </div>
  );
};

export default PainterRegisterPage;
