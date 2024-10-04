import type { FC } from 'react';
import { useDashboardPainter } from '@/context/dashboard/painter/provider';
import { TJob } from '@/types';
import { ButtonsCvaButton } from '@/components/cva/button';
import { InputsFile } from '@/components/inputs/file';
import { IconsLoading } from '@/components/icons/loading';
import { InputsText } from '@/components/inputs/text';

type TProps = TJob;
export const DashboardPainterJob: FC<TProps> = (
  job
) => {
  const dashboardPainter = useDashboardPainter();
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
      onSubmit={(event) => onQuoteSubmit(event, job.jobId)}
      className="flex flex-col gap-2 w-full lg:w-auto"
    >
      <InputsText
        type="number"
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
          classValue="gap-4"
        >
          {selectedFile?.name}
        </InputsFile>
      </div>
      <ButtonsCvaButton
        title={title}
        type="submit"
        disabled={isSubmitting}
        intent="primary"
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
