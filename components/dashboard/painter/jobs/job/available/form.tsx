import { FC } from 'react';
import { TJob } from '@/types/jobs';
import { CvaButton } from '@/components/cva/button';
import { InputsFile } from '@/components/inputs/file';
import { InputsText } from '@/components/inputs/text';
import { usePainterJobAvailable } from '@/components/dashboard/painter/jobs/job/available/hook';
import { IconsLoading16White } from '@/components/icons/loading/16/white';

type TProps = TJob;
export const DashboardPainterJobAvailableForm: FC<
  TProps
> = (job) => {
  const dashboardPainter = usePainterJobAvailable({
    id: job.jobId,
  });
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
      className="flex flex-col gap-4 w-full lg:w-auto"
    >
      <div className="flex flex-col sm:flex-row justify-stretch items-stretch gap-4">
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
                  titleClassValue="typography-file-sm"
                  title="Invoice"
                  onFile={onFileChange}
                  inputProps={{
                    accept: 'application/pdf',
                  }}
                  isValue={Boolean(selectedFile)}
                  gap="lg"
                >
                  {selectedFile ? (
                    <span className="text-xs">
                      {selectedFile?.name}
                    </span>
                  ) : null}
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
      <CvaButton
        title={title}
        type="submit"
        disabled={isSubmitting}
        size="sm"
        intent="primary"
        center
        icon={{
          Leading: isSubmitting
            ? IconsLoading16White
            : null,
        }}
        gap="xl"
      >
        <span>{title}</span>
      </CvaButton>
    </form>
  );
};
