import type { FC } from 'react';
import { useDashboardPainter } from '@/context/dashboard/painter/provider';
import { TJob } from '@/types';

type TProps = TJob;
export const DashboardPainterJobForm: FC<TProps> = (
  job
) => {
  const dashboardPainter = useDashboardPainter();
  const {
    isLoading,
    price,
    isJobWithinRange,
    onPriceSubmit,
    onPriceChange,
    onFileChange,
  } = dashboardPainter;
  return (
    <form
      onSubmit={(e) =>
        onPriceSubmit(e, job.jobId, parseFloat(price))
      }
      className="mt-4 w-full lg:w-auto"
    >
      <div className="flex flex-row">
        <input
          type="text"
          name="price"
          placeholder="Total Price"
          className="mr-2 p-2 border rounded w-full lg:w-auto"
          value={price}
          onChange={onPriceChange}
        />
        <label>
          Invoice (optional)
          <input
            type="file"
            onChange={onFileChange}
            accept="application/pdf"
            className="w-full lg:w-auto"
          />
        </label>
      </div>
      <button
        type="submit"
        className={`button-color hover:bg-green-900 text-white font-bold py-1 px-4 mt-2 rounded w-full lg:w-auto ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        disabled={isLoading}
      >
        {isLoading ? 'Submitting...' : 'Submit Quote'}
      </button>
    </form>
  );
};
