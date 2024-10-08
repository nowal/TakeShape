import type { FC } from 'react';
import { TJob } from '@/types';
import { ButtonsCvaButton } from '@/components/cva/button';
import { InputsFile } from '@/components/inputs/file';
import { InputsText } from '@/components/inputs/text';
import { useDashboardPainterJobForm } from '@/components/dashboard/painter/quotes/job/available/form';
import { IconsLoading } from '@/components/icons/loading';

type TProps = TJob;
export const DashboardPainterJob: FC<TProps> = (job) => {
  const dashboardPainter = useDashboardPainterJobForm(
    job.jobId
  );
  const {
    isSubmitting,
    price,
    selectedFile,
    onPriceChange,
    onQuoteSubmit,
    onFileChange,
  } = dashboardPainter;
  const title = isSubmitting
    ? 'Submitting...'
    : 'Submit Quote';

  return (
    <form
      onSubmit={onQuoteSubmit}
      className="flex flex-col gap-2 w-full lg:w-auto"
    >
      <InputsText
        type="number"
        placeholder="Price"
        value={price}
        onChange={onPriceChange}
        required
      />
      <div className="relative h-[96px]">
        <InputsFile
          title="Invoice (optional)"
          onFile={onFileChange}
          inputProps={{
            accept: 'application/pdf',
          }}
          isValue={Boolean(selectedFile)}
          gap="xl"
        >
          {selectedFile?.name}
        </InputsFile>
      </div>
      <ButtonsCvaButton
        title={title}
        type="submit"
        disabled={isSubmitting}
        size="sm"
        rounded="lg"
        center
        icon={isSubmitting ? { Leading: IconsLoading } : {}}
      >
        {title}
      </ButtonsCvaButton>
    </form>
  );
};
