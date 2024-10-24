'use client';
import { FC, Suspense } from 'react';
import { GoogleAnalytics } from '@next/third-parties/google';
import { FallbacksLoadingFill } from '@/components/fallbacks/loading';
import { cx } from 'class-variance-authority';
import { PreferencesLaborAndMaterials } from '@/components/preferences/labor-and-materials';
import { PreferencesCeilingFields } from '@/components/preferences/ceiling-fields';
import { PreferencesTrimFields } from '@/components/preferences/trim-fields';
import { PreferencesFooter } from '@/components/preferences/footer';
import { usePreferences } from '@/context/preferences/provider';
import { PreferencesInitial } from '@/components/preferences/initial';
import { PreferencesSpecialRequest } from '@/components/preferences/special-request';
import { PreferencesNotificationsPaintPreferences } from '@/components/preferences/notifications/paint-preferences';
import { PreferencesMoveFurniture } from '@/components/preferences/move-furniture';
import { TypographyFormTitle } from '@/components/typography/form/title';
import { TypographyFormSubtitle } from '@/components/typography/form/subtitle';

const DefaultPreferences: FC = () => {
  const preferences = usePreferences();
  const {
    isPopup,
    isLaborAndMaterials,
    isFetchingPreferences,
    onLaborAndMaterialsChange,
  } = preferences;

  if (isFetchingPreferences) return <FallbacksLoadingFill />;

  return (
    <div className="flex flex-col justify-start items-center">
      <GoogleAnalytics gaId="G-47EYLN83WE" />
      <div className="flex flex-col items-center w-full">
        <div className="flex flex-col items-stretch w-full sm:w-[709px]">
          <div className="h-6" />
          <>
            {isPopup ? (
              <PreferencesNotificationsPaintPreferences />
            ) : (
              <h2 className="typography-page-title-preferences">
                We want to make sure your quote is accurate.
              </h2>
            )}
            <div className="h-6" />
          </>
          <div
            className={cx(
              'flex flex-col items-stretch w-full py-9 px-6'
            )}
          >
            <TypographyFormTitle>
              What type of service would you like quoted?
            </TypographyFormTitle>
            <div className="h-4" />
            <PreferencesInitial
              onChange={onLaborAndMaterialsChange}
              isLaborAndMaterials={isLaborAndMaterials}
            />
            {isLaborAndMaterials && (
              <>
                <div className="h-14" />
                <TypographyFormSubtitle>
                  Please select your preferences
                </TypographyFormSubtitle>
                <div className="h-1" />
                <h5 className="typography-form-notification">
                  If you have difficulties with chosing the
                  option, please pick the “uncertain” in the
                  menu.
                </h5>
                <div className="h-4" />
                <PreferencesLaborAndMaterials />
              </>
            )}
            <div className="h-14" />
            <TypographyFormSubtitle>
              Do you need additional help?
            </TypographyFormSubtitle>
            <div className="h-4" />
            <div className="flex flex-col items-stretch gap-2">
              <PreferencesCeilingFields />
              <PreferencesTrimFields />
              <PreferencesMoveFurniture />
            </div>
            <PreferencesSpecialRequest />
            <div className="h-10 sm:h-5" />
            <PreferencesFooter />
          </div>
        </div>
      </div>
    </div>
  );
};

const DefaultPreferencesWithSuspense: FC = () => (
  <Suspense fallback={<FallbacksLoadingFill />}>
    <DefaultPreferences />
  </Suspense>
);

export default DefaultPreferencesWithSuspense;
