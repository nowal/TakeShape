import type { FC } from 'react';
import { TJob } from '@/types';

type TProps = TJob;
export const _DashboardPainterJobPreferences: FC<TProps> = (job) => {
  return (
    <div className="details-box space-y-2 w-full lg:w-auto">
      <p className="text-lg">
        Address:{' '}
        <span className="font-semibold">{job.address}</span>
      </p>
      <div className="space-y-1">
        <p className="text-lg">Paint Preferences</p>
        <ul className="list-disc pl-5">
          <li className="font-semibold">
            {job.paintPreferences?.laborAndMaterial
              ? 'Labor and Material'
              : 'Labor Only'}
          </li>
          <li>
            Wall Color:{' '}
            <span className="font-semibold">
              {job.paintPreferences?.laborAndMaterial
                ? job.paintPreferences?.color
                : 'N/A'}
            </span>
          </li>
          <li>
            Wall Finish:{' '}
            <span className="font-semibold">
              {job.paintPreferences?.laborAndMaterial
                ? job.paintPreferences?.finish
                : 'N/A'}
            </span>
          </li>
          <li>
            Paint Quality:{' '}
            <span className="font-semibold">
              {job.paintPreferences?.laborAndMaterial
                ? job.paintPreferences?.paintQuality
                : 'N/A'}
            </span>
          </li>
          <li>
            Ceilings:{' '}
            <span className="font-semibold">
              {job.paintPreferences?.ceilings
                ? 'Yes'
                : 'No'}
            </span>
          </li>
          <li>
            Ceiling Color:{' '}
            <span className="font-semibold">
              {job.paintPreferences?.ceilings &&
              job.paintPreferences?.laborAndMaterial
                ? job.paintPreferences?.ceilingColor
                : 'N/A'}
            </span>
          </li>
          <li>
            Ceiling Finish:{' '}
            <span className="font-semibold">
              {job.paintPreferences?.ceilings &&
              job.paintPreferences?.laborAndMaterial
                ? job.paintPreferences?.ceilingFinish
                : 'N/A'}
            </span>
          </li>
          <li>
            Trim and Doors:{' '}
            <span className="font-semibold">
              {job.paintPreferences?.trim ? 'Yes' : 'No'}
            </span>
          </li>
          <li>
            Trim and Door Color:{' '}
            <span className="font-semibold">
              {job.paintPreferences?.trim &&
              job.paintPreferences?.laborAndMaterial
                ? job.paintPreferences?.trimColor
                : 'N/A'}
            </span>
          </li>
          <li>
            Trim and Door Finish:{' '}
            <span className="font-semibold">
              {job.paintPreferences?.trim &&
              job.paintPreferences?.laborAndMaterial
                ? job.paintPreferences?.trimFinish
                : 'N/A'}
            </span>
          </li>
          <li>
            Move Furniture:{' '}
            <span className="font-semibold">
              {job.moveFurniture ? 'Yes' : 'No'}
            </span>
          </li>
        </ul>
      </div>
      <p className="text-lg">
        Special Requests:{' '}
        <span className="font-semibold">
          {job.specialRequests || 'N/A'}
        </span>
      </p>
    </div>
  );
};
