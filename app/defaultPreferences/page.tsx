'use client';;
import { FC, Suspense } from 'react';
import { GoogleAnalytics } from '@next/third-parties/google';
import { FallbacksLoading } from '@/components/fallbacks/loading';
import { cx } from 'class-variance-authority';
import { PreferencesLaborAndMaterials } from '@/components/preferences/labor-and-materials';
import { PreferencesCeilingFields } from '@/components/preferences/ceiling-fields';
import { PreferencesTrimFields } from '@/components/preferences/trim-fields';
import { PREFERENCES_NAME_BOOLEAN_MOVE_FURNITURE } from '@/atom/constants';
import { PreferencesFooter } from '@/components/preferences/footer';
import { usePreferences } from '@/components/preferences/hooks';
import { PreferencesInitial } from '@/components/preferences/initial';
import { PreferencesSpecialRequest } from '@/components/preferences/special-request';
import { PreferencesNotificationsPaintPreferences } from '@/components/preferences/notifications/paint-preferences';
import { PreferencesRowYesNo } from '@/components/preferences/row/yes-no';

const Preferences: FC = () => {
  const preferences = usePreferences();
  const {
    isPopup,
    isCeilingsPainted,
    isLaborAndMaterials,
    isLoading,
    isMoveFurniture,
    isTrimAndDoorsPainted,
    onChange,
    onValueChange,
    onLaborAndMaterialsChange,
    onPreferenceSubmit,
    dispatchMoveFurniture,
    dispatchSpecialRequests,
    specialRequests,
    isShowTrimFields,
    isShowCeilingFields,
    ...paintPreferences
  } = preferences
  return (
    <div className="flex flex-col justify-start items-center">
      <GoogleAnalytics gaId="G-47EYLN83WE" />
      <div className="flex flex-col items-center">
        <div className="flex flex-col items-stretch w-full sm:w-[709px]">
          <div className="h-6" />
          <h2 className="typography-page-title-preferences">
            We want to make sure your quote is accurate.
          </h2>
          <div className="h-20" />

          {isPopup && (
            <>
              <PreferencesNotificationsPaintPreferences />
              <div className="h-6" />
            </>
          )}

          <div className={cx('flex flex-col items-stretch w-full py-9 px-6')}>
            <h4 className="typography-form-title">
              What type of service would you like quoted?
            </h4>
            <div className="h-4" />
            <PreferencesInitial
              onChange={onLaborAndMaterialsChange}
              isLaborAndMaterials={isLaborAndMaterials}
            />
            {isLaborAndMaterials && (
              <>
                <div className="h-14" />
                <h4 className="typography-form-subtitle">
                  Please select your preferences
                </h4>
                <div className="h-1" />
                <h5 className="typography-form-notification">
                  If you have difficulties with chosing the
                  option, please pick the “uncertain” in the
                  menu.
                </h5>
                <div className="h-4" />
                <PreferencesLaborAndMaterials
                  onValueChange={onValueChange}
                  onChange={onChange}
                  color={paintPreferences.color}
                  finish={paintPreferences.finish}
                  paintQuality={
                    paintPreferences.paintQuality
                  }
                />
              </>
            )}
            <div className="h-14" />
            <h4 className="typography-form-subtitle">
              Do you need additional help?
            </h4>
            <div className="h-4" />
            <div className="flex flex-col items-stretch gap-2">
              <PreferencesCeilingFields
                isCeilingsPainted={isCeilingsPainted}
                onValueChange={onValueChange}
                onChange={onChange}
                ceilingColor={paintPreferences.ceilingColor}
                ceilingFinish={
                  paintPreferences.ceilingFinish
                }
                isSelected={
                  isShowCeilingFields && isLaborAndMaterials
                }
              />
              <PreferencesTrimFields
                isTrimAndDoorsPainted={
                  isTrimAndDoorsPainted
                }
                trimColor={paintPreferences.trimColor}
                trimFinish={paintPreferences.trimFinish}
                onChange={onChange}
                onValueChange={onValueChange}
                isSelected={
                  isShowTrimFields && isLaborAndMaterials
                }
              />
              <PreferencesRowYesNo
                name={
                  PREFERENCES_NAME_BOOLEAN_MOVE_FURNITURE
                }
                isChecked={isMoveFurniture}
                onChange={() => {
                  dispatchMoveFurniture((prev) => !prev);
                }}
                classValue="fill-gray-base"
              >
                Will the painters need to move any
                furniture?
              </PreferencesRowYesNo>
            </div>
            <PreferencesSpecialRequest
              value={specialRequests}
              onChange={(event) =>
                dispatchSpecialRequests(
                  event.currentTarget.value
                )
              }
            />
            <div className="h-5" />
            <PreferencesFooter
              isLoading={isLoading}
              onPreferenceSubmit={onPreferenceSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const PreferencesWithSuspense: FC = () => (
  <Suspense fallback={<FallbacksLoading />}>
    <Preferences />
  </Suspense>
);

export default PreferencesWithSuspense;
