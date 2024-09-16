'use client';
import React, { FC, Suspense } from 'react';
import { GoogleAnalytics } from '@next/third-parties/google';
import { FallbacksLoading } from '@/components/fallbacks/loading';
import { NotificationsHighlight } from '@/components/notifications/highlight';
import { cx } from 'class-variance-authority';
import { DefaultPreferencesFooter } from '@/components/preferences/footer';
import { useDefaultPreferences } from '@/components/preferences/hook';
import { OptionsLaborAndMaterials } from '@/components/preferences/options/labor-and-materials';
import { DefaultPreferencesOptions } from '@/components/preferences/options';
import { DefaultPreferencesOptionsInitial } from '@/components/preferences/options/initial';
import { DefaultPreferencesOptionsPopup } from '@/components/preferences/popup';
import { DefaultPreferencesSpecialRequest } from '@/components/preferences/special-request';
import { LaborAndMaterialsCeilingFields } from '@/components/preferences/options/labor-and-materials/ceiling-fields';
import { DefaultPreferencesEnd } from '@/components/preferences/end';
import { LaborAndMaterialsShowFields } from '@/components/preferences/options/labor-and-materials/show-fields';

const DefaultPreferences: FC = () => {
  const {
    isPopup,
    isCeilingsPainted,
    isLaborAndMaterials,
    isLoading,
    isMoveFurniture,
    isTrimAndDoorsPainted,
    onChange,
    onValueChange,
    onLaborMaterialChange,
    onPreferenceSubmit,
    onSpecialRequests,
    specialRequests,
    // color,
    // finish,
    // trim,
    // trimColor,
    // trimFinish,
    isShowTrimFields,
    isShowCeilingFields,
    ...paintPreferences
  } = useDefaultPreferences();
  // console.log(isLaborAndMaterials, paintvPreferences);

  return (
    <div className="defaultPreferences flex flex-col justify-start items-center h-screen mb-32">
      <GoogleAnalytics gaId="G-47EYLN83WE" />
      <div className="flex flex-col items-center">
        <div className="flex flex-col items-center w-[718px]">
          <h2 className="typography-page-title-preferences">
            We want to make sure your quote is accurate.
          </h2>
          <NotificationsHighlight classValue="mt-2">
            None of your information will be shared with
            painters until you accept a quote. Rest assured,
            your privacy is our priority.
          </NotificationsHighlight>
          {isPopup && <DefaultPreferencesOptionsPopup />}
          <div
            className={cx(
              'fill-column-white',
              'gap-2',
              'mt-4'
            )}
          >
            <h4 className="typography-form-title">
              What type of service would you like quoted?
            </h4>
            <DefaultPreferencesOptionsInitial
              onChange={onLaborMaterialChange}
              isLaborAndMaterials={isLaborAndMaterials}
            />
            <h4 className="typography-form-subtitle">
              Do you need additional help?
            </h4>
            <DefaultPreferencesOptions
              isCeilingsPainted={isCeilingsPainted}
              isMoveFurniture={isMoveFurniture}
              isTrimAndDoorsPainted={isTrimAndDoorsPainted}
              onChange={onChange}
            />
            {isLaborAndMaterials && (
              <>
                <OptionsLaborAndMaterials
                  onValueChange={onValueChange}
                  onChange={onChange}
                  color={paintPreferences.color}
                  finish={paintPreferences.finish}
                  paintQuality={
                    paintPreferences.paintQuality
                  }
                />
                <LaborAndMaterialsCeilingFields
                  isCeilingsPainted={isCeilingsPainted}
                  onValueChange={onValueChange}
                  ceilingColor={
                    paintPreferences.ceilingColor
                  }
                  ceilingFinish={
                    paintPreferences.ceilingFinish
                  }
                  isSelected={
                    isShowCeilingFields &&
                    isLaborAndMaterials
                  }
                />
                <LaborAndMaterialsShowFields
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
                <DefaultPreferencesEnd />
              </>
            )}
            <DefaultPreferencesSpecialRequest
              value={specialRequests}
              onChange={(e) =>
                onSpecialRequests(e.target.value)
              }
            />
            <DefaultPreferencesFooter
              isLoading={isLoading}
              onPreferenceSubmit={onPreferenceSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const DefaultPreferencesWithSuspense: FC = () => (
  <Suspense fallback={<FallbacksLoading />}>
    <DefaultPreferences />
  </Suspense>
);

export default DefaultPreferencesWithSuspense;
