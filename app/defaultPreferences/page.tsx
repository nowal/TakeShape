'use client';
import React, { FC, Suspense } from 'react';
import { GoogleAnalytics } from '@next/third-parties/google';
import { FallbacksLoading } from '@/components/fallbacks/loading';
import { NotificationsHighlight } from '@/components/notifications/highlight';
import { cx } from 'class-variance-authority';
import { DefaultPreferencesFooter } from '@/app/defaultPreferences/_footer';
import { DefaultPreferencesOptionsInitial } from '@/app/defaultPreferences/_options/_initial';
import { DefaultPreferencesSpecialRequest } from '@/app/defaultPreferences/_special-request';
import { DefaultPreferencesOptions } from '@/app/defaultPreferences/_options';
import { useDefaultPreferences } from '@/app/defaultPreferences/_hook';
import { DefaultPreferencesOptionsPopup } from '@/app/defaultPreferences/_popup';
import { LaborAndMaterials } from '@/app/defaultPreferences/_labor-and-materials';

const DefaultPreferences: FC = () => {
  const {
    isPopup,
    isCeilingsPainted,
    isLaborAndMaterials,
    isLoading,
    isMoveFurniture,
    isTrimAndDoorsPainted,
    handleChange,
    handleLaborMaterialChange,
    handlePreferenceSubmit,
    laborAndMaterial,
    setSpecialRequests,
    specialRequests,
  } = useDefaultPreferences();

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
              onChange={handleLaborMaterialChange}
              isLaborAndMaterials={isLaborAndMaterials}
            />
            <h4 className="typography-form-subtitle">
              Do you need additional help?
            </h4>
            <DefaultPreferencesOptions
              isCeilingsPainted={isCeilingsPainted}
              isMoveFurniture={isMoveFurniture}
              isTrimAndDoorsPainted={isTrimAndDoorsPainted}
              onChange={handleChange}
            />
            {laborAndMaterial && (
              <LaborAndMaterials
                onChange={handleChange}
                color={''}
                finish={''}
                paintQuality={''}
              />
            )}
            <DefaultPreferencesSpecialRequest
              value={specialRequests}
              onChange={(e) =>
                setSpecialRequests(e.target.value)
              }
            />
            <DefaultPreferencesFooter
              isLoading={isLoading}
              onPreferenceSubmit={handlePreferenceSubmit}
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
