import type { FC } from 'react';
import { useDashboardPainter } from '@/context/dashboard/painter/provider';
import { TJob } from '@/types';

type TProps = TJob;
export const DashboardPainterJobFormCompleted: FC<
  TProps
> = (job) => {
  const dashboardPainter = useDashboardPainter();
  const { user } = dashboardPainter;

  return (
    <div>
      <div>
        <p className="text-lg font-bold mt-4">
          Your Quoted Price:
          <span className="text-xl">
            $
            {job.prices
              .find(
                (price) => price.painterId === user?.uid
              )
              ?.amount.toFixed(2)}
          </span>
          {job.prices.find(
            (price) => price.painterId === user?.uid
          )?.invoiceUrl && (
            <a
              href={
                job.prices.find(
                  (price) => price.painterId === user?.uid
                )?.invoiceUrl
              }
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline ml-2"
            >
              Invoice
            </a>
          )}
        </p>
      </div>
      <div className="details-box space-y-2 w-full lg:w-auto">
        <div className="space-y-1">
          <p className="text-lg">Paint Preferences:</p>
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
                  ? job.paintPreferences?.color || 'N/A'
                  : 'N/A'}
              </span>
            </li>
            <li>
              Wall Finish:{' '}
              <span className="font-semibold">
                {job.paintPreferences?.laborAndMaterial
                  ? job.paintPreferences?.finish || 'N/A'
                  : 'N/A'}
              </span>
            </li>
            <li>
              Paint Quality:{' '}
              <span className="font-semibold">
                {job.paintPreferences?.laborAndMaterial
                  ? job.paintPreferences?.paintQuality ||
                    'N/A'
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
                  ? job.paintPreferences?.ceilingColor ||
                    'N/A'
                  : 'N/A'}
              </span>
            </li>
            <li>
              Ceiling Finish:{' '}
              <span className="font-semibold">
                {job.paintPreferences?.ceilings &&
                job.paintPreferences?.laborAndMaterial
                  ? job.paintPreferences?.ceilingFinish ||
                    'N/A'
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
                  ? job.paintPreferences?.trimColor || 'N/A'
                  : 'N/A'}
              </span>
            </li>
            <li>
              Trim and Door Finish:{' '}
              <span className="font-semibold">
                {job.paintPreferences?.trim &&
                job.paintPreferences?.laborAndMaterial
                  ? job.paintPreferences?.trimFinish ||
                    'N/A'
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
    </div>
  );
};
