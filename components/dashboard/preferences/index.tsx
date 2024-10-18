import type { FC } from 'react';
import { TJobUserData } from '@/types';
import { TypographyFormSubtitle } from '@/components/typography/form/subtitle';
import { TypographyDetailsTitle } from '@/components/typography/details/title';
import { DashboardPainterJobPanel } from '@/components/dashboard/painter/jobs/job/panel';
import { TypographyDetailsPink } from '@/components/typography/details/pink';
import { IconsLabor25 } from '@/components/icons/labor/25';
import { IconsLaborAndMaterials } from '@/components/icons/labor-and-materials';
import { cx } from 'class-variance-authority';
import { DashboardPainterJobPreferencesRow } from '@/components/dashboard/preferences/row';
import { TPropsWithChildren } from '@/types/dom/main';
import { PREFERENCES_NAME_BOOLEAN_LABOR_AND_MATERIAL } from '@/atom/constants';
import { TPaintPreferences } from '@/types/preferences';

type TProps = TPropsWithChildren<
  TPaintPreferences & TJobUserData
>;
export const DashboardPreferences: FC<TProps> = ({
  children,
  ...paintPreferences
}) => {
  const isLaborAndMaterials =
    paintPreferences?.[
      PREFERENCES_NAME_BOOLEAN_LABOR_AND_MATERIAL
    ];

  return (
    <div className="flex flex-col items-stretch gap-3">
      {children && (
        <div>
          <TypographyFormSubtitle>
            {children}
          </TypographyFormSubtitle>
        </div>
      )}
      <div
        className={cx(
          'flex flex-row items-center justify-between',
          'p-4',
          'py-2.5',
          'shadow-32-08 bg-white text-pink border border-pink rounded-lg'
        )}
      >
        <TypographyDetailsTitle classValue="text-pink">
          {isLaborAndMaterials
            ? 'Labor and Material'
            : 'Labor Only'}
        </TypographyDetailsTitle>
        {isLaborAndMaterials ? (
          <IconsLaborAndMaterials height="25" width="30" />
        ) : (
          <IconsLabor25 />
        )}
      </div>
      <DashboardPainterJobPreferencesRow
        title="Wall"
        items={[
          [
            'Color',
            paintPreferences?.laborAndMaterial
              ? paintPreferences?.color || 'N/A'
              : 'N/A',
          ],
          [
            'Finish',
            paintPreferences?.laborAndMaterial
              ? paintPreferences?.finish || 'N/A'
              : 'N/A',
          ],
          [
            'Quality',
            (paintPreferences?.laborAndMaterial
              ? paintPreferences?.paintQuality || 'N/A'
              : 'N/A'
            )
              .replace('Quality', '')
              .trim(),
          ],
        ]}
      />
      {paintPreferences?.ceilings && (
        <DashboardPainterJobPreferencesRow
          title="Ceilings"
          items={[
            [
              'Color',
              paintPreferences?.ceilings &&
              paintPreferences?.laborAndMaterial
                ? paintPreferences?.ceilingColor || 'N/A'
                : 'N/A',
            ],
            [
              'Finish',
              paintPreferences?.ceilings &&
              paintPreferences?.laborAndMaterial
                ? paintPreferences?.ceilingFinish || 'N/A'
                : 'N/A',
            ],
          ]}
        />
      )}
      {paintPreferences?.trim && (
        <DashboardPainterJobPreferencesRow
          title="Trim and Doors"
          items={[
            [
              'Color',
              paintPreferences?.trim &&
              paintPreferences?.laborAndMaterial
                ? paintPreferences?.trimColor || 'N/A'
                : 'N/A',
            ],
            [
              'Finish',
              paintPreferences?.trim &&
              paintPreferences?.laborAndMaterial
                ? paintPreferences?.trimFinish || 'N/A'
                : 'N/A',
            ],
          ]}
        />
      )}
      <DashboardPainterJobPanel classValue="flex flex-row justify-between">
        <TypographyDetailsTitle>
          Move Furniture
        </TypographyDetailsTitle>
        <TypographyDetailsPink classValue="font-semibold">
          {paintPreferences.moveFurniture ? 'Yes' : 'No'}
        </TypographyDetailsPink>
      </DashboardPainterJobPanel>
      {paintPreferences.specialRequests && (
        <DashboardPainterJobPanel classValue="flex flex-col">
          <TypographyDetailsPink>
            Special Requests
          </TypographyDetailsPink>
          <TypographyDetailsTitle>
            {paintPreferences.specialRequests}
          </TypographyDetailsTitle>
        </DashboardPainterJobPanel>
      )}
    </div>
  );
};
