import type { FC } from 'react';
import { TJob } from '@/types';
import { TypographyFormSubtitle } from '@/components/typography/form/subtitle';
import { TypographyFormTitle } from '@/components/typography/form/title';

type TProps = TJob;
export const DashboardPainterJobFormPreferencesList: FC<
  TProps
> = (job) => {
  return (
    <ul>
      <li>
        <TypographyFormTitle>
          {job.paintPreferences?.laborAndMaterial
            ? 'Labor and Material'
            : 'Labor Only'}
        </TypographyFormTitle>
      </li>
      {(
        [
          [
            'Wall Color',
            job.paintPreferences?.laborAndMaterial
              ? job.paintPreferences?.color || 'N/A'
              : 'N/A',
          ],
          [
            'Wall Finish',
            job.paintPreferences?.laborAndMaterial
              ? job.paintPreferences?.finish || 'N/A'
              : 'N/A',
          ],
          [
            'Paint Quality',
            job.paintPreferences?.laborAndMaterial
              ? job.paintPreferences?.paintQuality || 'N/A'
              : 'N/A',
          ],
          [
            'Ceilings',
            job.paintPreferences?.ceilings ? 'Yes' : 'No',
          ],
          [
            'Ceiling Color:',
            job.paintPreferences?.ceilings &&
            job.paintPreferences?.laborAndMaterial
              ? job.paintPreferences?.ceilingColor || 'N/A'
              : 'N/A',
          ],
          [
            'Ceiling Finish:',
            job.paintPreferences?.ceilings &&
            job.paintPreferences?.laborAndMaterial
              ? job.paintPreferences?.ceilingFinish || 'N/A'
              : 'N/A',
          ],
          [
            'Trim and Doors',
            job.paintPreferences?.trim ? 'Yes' : 'No',
          ],
          [
            'Trim and Door Color:',
            job.paintPreferences?.trim &&
            job.paintPreferences?.laborAndMaterial
              ? job.paintPreferences?.trimColor || 'N/A'
              : 'N/A',
          ],
          [
            'Trim and Door Finish:',
            job.paintPreferences?.trim &&
            job.paintPreferences?.laborAndMaterial
              ? job.paintPreferences?.trimFinish || 'N/A'
              : 'N/A',
          ],
          [
            'Move Furniture',
            job.moveFurniture ? 'Yes' : 'No',
          ],
        ] as const
      ).map(([title, value]) => (
        <li className="flex flex-row gap-1" key={title}>
          <TypographyFormSubtitle>
            {title}
          </TypographyFormSubtitle>
          <span className="font-semibold">{value}</span>
        </li>
      ))}
    </ul>
  );
};
