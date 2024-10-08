import { FC, Fragment } from 'react';
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
      <div className="flex flex-col sm:flex-row justify-stretch items-stretch gap-2">
        {(
          [
            {
              key: 'price',
              input: (
                <InputsText
                  type="number"
                  placeholder="Price"
                  value={price}
                  onChange={onPriceChange}
                  required
                />
              ),
            },
            {
              key: 'invoice',
              input: (
                <InputsFile
                  title="Invoice (optional)"
                  onFile={onFileChange}
                  inputProps={{
                    accept: 'application/pdf',
                  }}
                  classValue="typography-file-sm"
                  isValue={Boolean(selectedFile)}
                  gap="xl"
                >
                  {selectedFile && (
                    <span className="text-xs">
                      {selectedFile?.name}
                    </span>
                  )}
                </InputsFile>
              ),
            },
          ] as const
        ).map(({ key, input }) => (
          <div
            className="relative w-full h-[54px] sm:w-1/2"
            key={key}
          >
            {input}
          </div>
        ))}
      </div>
      <ButtonsCvaButton
        title={title}
        type="submit"
        disabled={isSubmitting}
        size="sm"
        // rounded="lg"
        intent="primary"
        center
        icon={isSubmitting ? { Leading: IconsLoading } : {}}
      >
        <span>{title}</span>
      </ButtonsCvaButton>
    </form>
  );
};
