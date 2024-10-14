import { FC } from 'react';
import { TJob } from '@/types';
import { ButtonsCvaButton } from '@/components/cva/button';
import { InputsFile } from '@/components/inputs/file';
import { InputsText } from '@/components/inputs/text';
import { useDashboardPainterJobAvailable } from '@/components/dashboard/painter/quotes/job/available/hook';
import { IconsLoading } from '@/components/icons/loading';

type TProps = TJob;
export const DDashboardPainterJobAvailableForm: FC<
  TProps
> = (job) => {
  const dashboardPainter = useDashboardPainterJobAvailable(
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
                  title="Invoice (optional)"
                  onFile={onFileChange}
                  inputProps={{
                    accept: 'application/pdf',
                  }}
                  isValue={Boolean(selectedFile)}
                  gap="lg"
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
