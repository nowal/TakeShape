import { cx } from 'class-variance-authority';
import { ButtonsQuoteSubmit } from '@/components/buttons/quote/submit';
import { InputsFile } from '@/components/inputs/file';
import { InputsText } from '@/components/inputs/text';
import { useQuote } from '@/context/quote/provider';
import { FC } from 'react';
import { useQuoteTitle } from '@/components/quote/title';
import { IconsTick20 } from '@/components/icons/tick/20';
import { IconsLoading } from '@/components/icons/loading';

type TProps = { fixedTitle?: string };
export const ComponentsQuoteInput: FC<TProps> = ({
  fixedTitle,
}) => {
  const {
    isUploading: isInitUploading,
    progress,
    uploadStatus,
    fileName,
    title: _title,
    dispatchTitle,
    onFileUpload,
    onSubmit,
  } = useQuote();
  const title = fixedTitle ?? _title;

  const isValue = Boolean(title);
  const isUploading = uploadStatus === 'uploading';
  const isCompleted = uploadStatus === 'completed';
  const isError = uploadStatus === 'error';
  const fileTitle = useQuoteTitle();

  return (
    <div className="flex flex-col items-center gap-[26px]">
      <form
        className={cx(
          'fill-column-white',
          'gap-2.5',
          'xs:w-[23.875rem]'
        )}
        onSubmit={onSubmit}
      >
        <div className="relative w-full">
          <div
            className={cx(
              'relative h-[7.25rem]',
              isCompleted && 'text-green'
            )}
          >
            <InputsFile
              title={fileTitle}
              onFile={onFileUpload}
              {...(isCompleted
                ? {
                    icon: { Leading: IconsTick20 },
                    intent: 'ghost-success',
                  }
                : isUploading
                ? {
                    icon: { Leading: IconsLoading },
                  }
                : {})}
              inputProps={{}}
            >
              {fileName && (
                <div className="absolute right-0 bottom-0 w-full truncate font-open-sans text-xs p-2 text-gray text-left">
                  <div>{fileName}</div>
                </div>
              )}
            </InputsFile>
          </div>
        </div>
        <InputsText
          value={title}
          onChange={(event) =>
            dispatchTitle(event.target.value)
          }
          placeholder="Enter Title (e.g. Bedroom Walls) *"
        />
        <ButtonsQuoteSubmit
          title="Submit Video"
          isDisabled={!isValue}
        />
      </form>
    </div>
  );
};
