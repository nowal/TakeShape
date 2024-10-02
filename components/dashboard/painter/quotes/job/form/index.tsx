import type { FC } from 'react';
import { useDashboardPainter } from '@/context/dashboard/painter/provider';
import { TJob } from '@/types';
import { ButtonsCvaButton } from '@/components/cva/button';
import { InputsFile } from '@/components/inputs/file';

type TProps = TJob;
export const DashboardPainterJobForm: FC<TProps> = (
  job
) => {
  const dashboardPainter = useDashboardPainter();
  const { isLoading, price, onPriceSubmit, onFileChange } =
    dashboardPainter;
  const title = isLoading
    ? 'Submitting...'
    : 'Submit Quote';

  return (
    <form
      onSubmit={(e) =>
        onPriceSubmit(e, job.jobId, parseFloat(price))
      }
      className="w-full lg:w-auto"
    >
      <div className="relative h-[96px]">
        <InputsFile
          title="Invoice (optional)"
          onFile={onFileChange}
          inputProps={{
            accept: 'application/pdf',
          }}
        />
      </div>

      <ButtonsCvaButton
        title={title}
        type="submit"
        className={`button-color hover:bg-green-900 text-white font-bold py-1 px-4 mt-2 rounded w-full lg:w-auto ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        disabled={isLoading}
      >
        {title}
      </ButtonsCvaButton>
    </form>
  );
};
