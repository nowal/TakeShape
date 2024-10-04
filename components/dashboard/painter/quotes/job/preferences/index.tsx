import type { FC } from 'react';
import { TJob } from '@/types';
import { TypographyFormSubtitle } from '@/components/typography/form/subtitle';
import { TypographyDetailsTitle } from '@/components/typography/details/title';
import { DashboardPainterJobPanel } from '@/components/dashboard/painter/quotes/job/panel';
import { TypographyDetailsPink } from '@/components/typography/details/pink';
import { IconsLabor25 } from '@/components/icons/labor/25';
import { IconsLaborAndMaterials } from '@/components/icons/labor-and-materials';
import { cx } from 'class-variance-authority';
import { DashboardPainterJobPreferencesRow } from '@/components/dashboard/painter/quotes/job/preferences/row';

type TProps = TJob;
export const DashboardPainterJobPreferences: FC<TProps> = (
  job
) => {
  const isLaborAndMaterials =
    job.paintPreferences?.laborAndMaterial;
  return (
    <div className="flex flex-col items-stretch gap-3">
      <div>
        <TypographyFormSubtitle>
          Client Preferences
        </TypographyFormSubtitle>
      </div>
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
            job.paintPreferences?.laborAndMaterial
              ? job.paintPreferences?.color || 'N/A'
              : 'N/A',
          ],
          [
            'Finish',
            job.paintPreferences?.laborAndMaterial
              ? job.paintPreferences?.finish || 'N/A'
              : 'N/A',
          ],
          [
            'Quality',
            (job.paintPreferences?.laborAndMaterial
              ? job.paintPreferences?.paintQuality || 'N/A'
              : 'N/A'
            )
              .replace('Quality', '')
              .trim(),
          ],
        ]}
        {...job}
      />
      {job.paintPreferences?.ceilings && (
        <DashboardPainterJobPreferencesRow
          title="Ceilings"
          items={[
            [
              'Color',
              job.paintPreferences?.ceilings &&
              job.paintPreferences?.laborAndMaterial
                ? job.paintPreferences?.ceilingColor ||
                  'N/A'
                : 'N/A',
            ],
            [
              'Finish',
              job.paintPreferences?.ceilings &&
              job.paintPreferences?.laborAndMaterial
                ? job.paintPreferences?.ceilingFinish ||
                  'N/A'
                : 'N/A',
            ],
          ]}
          {...job}
        />
      )}
      {job.paintPreferences?.trim && (
        <DashboardPainterJobPreferencesRow
          title="Trim and Doors"
          items={[
            [
              'Color',
              job.paintPreferences?.trim &&
              job.paintPreferences?.laborAndMaterial
                ? job.paintPreferences?.trimColor || 'N/A'
                : 'N/A',
            ],
            [
              'Finish',
              job.paintPreferences?.trim &&
              job.paintPreferences?.laborAndMaterial
                ? job.paintPreferences?.trimFinish || 'N/A'
                : 'N/A',
            ],
          ]}
          {...job}
        />
      )}
      <DashboardPainterJobPanel classValue="flex flex-row justify-between">
        <TypographyDetailsTitle>
          Move Furniture
        </TypographyDetailsTitle>
        <TypographyDetailsPink classValue="font-semibold">
          {job.moveFurniture ? 'Yes' : 'No'}
        </TypographyDetailsPink>
      </DashboardPainterJobPanel>
      {job.specialRequests && (
        <DashboardPainterJobPanel classValue="flex flex-col">
          <TypographyDetailsPink>
            Special Requests
          </TypographyDetailsPink>
          <TypographyDetailsTitle>
            {job.specialRequests}
          </TypographyDetailsTitle>
        </DashboardPainterJobPanel>
      )}
    </div>
  );
};
